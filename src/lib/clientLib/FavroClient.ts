import { BravoError } from '$lib/errors.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import { FavroResponse } from '$lib/clientLib/FavroResponse';
import { isNullish, toBase64 } from '$lib/utility.js';
import { Logger, LoggerUtility } from '../Logger';

type OptionFavroHttpMethod = 'get' | 'post' | 'put' | 'delete';

export interface OptionsFavroRequest {
  method?: OptionFavroHttpMethod;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  /**
   * BravoClients use the last-received Backend ID by default,
   * but you can override this if necessary.
   */
  backendId?: string;
  excludeOrganizationId?: boolean;
  requireOrganizationId?: boolean;
}

const favroApiBaseUrl = 'https://favro.com/api/v1';

function createFavroApiUrl(url: string, params?: Record<string, string>) {
  // Ensure initial slash
  if (!url.startsWith('https://favro.com')) {
    url = url.startsWith('/') ? url : `/${url}`;
    url = `${favroApiBaseUrl}${url}`;
  }
  const fullUrl = new URL(url);
  if (params) {
    for (const param of Object.keys(params)) {
      const value = params[param];
      if (!isNullish(value)) {
        fullUrl.searchParams.set(param, params[param]);
      }
    }
  }
  return fullUrl.toString();
}

function createBasicAuthHeader(username: string, password: string) {
  const encodedCredentials = toBase64(`${username}:${password}`);
  return {
    Authorization: `Basic ${encodedCredentials}`,
  };
}

function computeBodyProps(body?: any) {
  let contentType: string | undefined;
  if (typeof body != 'undefined') {
    if (Buffer.isBuffer(body)) {
      contentType = 'application/octet-stream';
    } else if (typeof body == 'string') {
      contentType = 'text/markdown';
    } else {
      body = JSON.stringify(body);
      contentType = 'application/json';
    }
  }
  return { contentType, body };
}

function throwIfBodyAndMethodIncompatible(
  method: OptionFavroHttpMethod,
  body?: any,
) {
  if (body && ['get', 'delete'].includes(method)) {
    throw new BravoError(`HTTP Bodies not allowed for ${method} method`);
  }
}

/**
 * Remove `undefined` headers and stringify all other values.
 */
function cleanHeaders(rawHeaders: Record<string, any>) {
  return Object.keys(rawHeaders).reduce(
    (acc, header: keyof typeof rawHeaders) => {
      if (typeof rawHeaders[header] == 'undefined') {
        return acc;
      }
      acc[header] = `${rawHeaders[header]}`;
      return acc;
    },
    {} as Record<string, string>,
  );
}

export interface FavroClientAuth {
  token: string;
  organizationId: string;
  userEmail: string;
}

export class FavroClient {
  protected _token!: string;
  protected _organizationId!: string;
  /**
   * Authentication requires the user's identifer (their email address)
   */
  protected _userEmail!: string;
  /**
   * The response header X-RateLimit-Remaining informs how many
   * requests we can make before being blocked. Use this to ensure
   * we don't frequently hit those! X-RateLimit-Reset is the time
   * when the limit will be reset.
   */
  protected _requestsRemaining = Infinity;

  protected _requestsLimit = Infinity;
  protected _requestsMade = 0;
  protected _limitResetsAt?: Date;
  private _backendId?: string;
  private _fetch = fetch;

  readonly error = BravoError;

  /**
   * @param customFetch - Optional `node-fetch` replacement
   *                      to be used for *all* requests. Must be
   *                      a drop-in replacement!
   */
  constructor(
    options?: FavroClientAuth,
    extendedOptions?: {
      customFetch?: typeof fetch;
      logger?: LoggerUtility;
      /** Optionally use a custom Error class */
      error?: typeof BravoError;
    },
  ) {
    this.error = extendedOptions?.error || BravoError;
    Logger.loggingUtility = extendedOptions?.logger || console;
    for (const [optionsName, envName] of [
      ['token', 'FAVRO_TOKEN'],
      ['userEmail', 'FAVRO_USER_EMAIL'],
      ['organizationId', 'FAVRO_ORGANIZATION_ID'],
    ] as const) {
      const value = options?.[optionsName] || process.env[envName];
      this.assert(value, `A Favro ${optionsName} is required.`);
      this[`_${optionsName}` as const] = value;
    }
    if (extendedOptions?.customFetch) {
      this._fetch = extendedOptions?.customFetch;
    }
  }

  assert(claim: any, message: string): asserts claim {
    if (!claim) {
      throw new this.error(message);
    }
  }

  get organizationId(): string | undefined {
    return this._organizationId;
  }

  get requestStats() {
    return {
      totalRequests: this._requestsMade,
      limitRemaining: this._requestsRemaining,
      limit: this._requestsLimit,
      limitResetsAt: this._limitResetsAt,
    };
  }

  /**
   * General API request function against Favro's HTTP API.
   * Defaults to a GET request. Default headers are automatically handled.
   *
   * 📄 https://favro.com/developer/
   *
   * @param url - Relative to the base URL https://favro.com/api/v1
   */
  async request<Data = null, Fetcher extends typeof fetch = typeof fetch>(
    url: string,
    options?: OptionsFavroRequest,
    /**
     * Optionally override the default `node-fetch` client
     * (must be a drop-in replacement!)
     */
    customFetch?: Fetcher,
  ) {
    const debugBase = `bravo:http:`;
    const debugBasic = Logger.debug(`${debugBase}basic`);
    const debugHeaders = Logger.debug(`${debugBase}headers`);
    const debugBodies = Logger.debug(`${debugBase}bodies`);
    const debugStats = Logger.debug(`${debugBase}stats`);
    this.assert(
      this._organizationId || !options?.requireOrganizationId,
      'An organizationId must be set for this request',
    );
    const method = options?.method || 'get';
    throwIfBodyAndMethodIncompatible(method, options?.body);
    // Ensure initial slash
    const fullUrl = createFavroApiUrl(url, options?.query);
    const { contentType, body } = computeBodyProps(options?.body);
    const headers = cleanHeaders({
      Host: 'favro.com', // Required by API (otherwise fails without explanation)
      'Content-Type': contentType!,
      ...options?.headers,
      ...createBasicAuthHeader(this._userEmail, this._token),
      'User-Agent': `BravoClient <https://github.com/bscotch/favro-sdk>`,
      organizationId: options?.excludeOrganizationId
        ? undefined
        : this._organizationId,
      'X-Favro-Backend-Identifier': options?.backendId || this._backendId!,
    });
    this._requestsMade++;
    const reqOptions = {
      method,
      headers, // Force it to assume no undefineds
      body,
    };
    debugBasic(
      `sent ${method.toUpperCase()} ${fullUrl.replace(/^.?\.com\b/, '')}`,
    );
    debugHeaders(`sent %O`, headers);
    debugBodies(`sent %O`, body);
    const rawResponse = await (customFetch || this._fetch)(fullUrl, reqOptions);
    debugBasic(
      `got ${rawResponse.status} ${rawResponse.headers.get('Content-Type')} ${
        rawResponse.size
      }b`,
    );
    debugHeaders(`got %O`, rawResponse.headers.raw());
    debugStats(`%O`, this.requestStats);
    const res = new FavroResponse<Data, this>(this, rawResponse);
    this._backendId = res.backendId || this._backendId;
    this._limitResetsAt = res.limitResetsAt;
    this._requestsLimit = res.limit ?? this._requestsRemaining;
    this._requestsRemaining = res.requestsRemaining ?? this._requestsRemaining;

    if (this._requestsRemaining < 1 || res.status == 429) {
      // TODO: Set an interval before allowing requests to go through again, OR SOMETHING
      Logger.warn(
        `Favro API rate limit reached! ${JSON.stringify(
          this.requestStats,
          null,
          2,
        )}`,
      );
    }
    if (res.status > 299) {
      Logger.error(`Favro API Error: ${res.status}`, {
        url,
        method,
        body: await rawResponse.text(),
      });
    }
    this.assert(res.status < 300, `Failed with status ${res.status}`);
    const parsedBody = await res.getParsedBody();
    debugBodies(`got %O`, parsedBody);
    if (
      parsedBody &&
      typeof parsedBody != 'string' &&
      'message' in parsedBody
    ) {
      // @ts-expect-error
      const message = parsedBody.message;
      throw new this.error(
        `Unexpected combo of status code (${res.status}) and response body ("${message}")`,
      );
    }
    return res;
  }
}
