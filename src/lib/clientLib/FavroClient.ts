import { BravoError } from '$lib/errors.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import { FavroResponse } from '$lib/clientLib/FavroResponse';
import { isNullish, toBase64 } from '$lib/utility.js';
import type { AnyFunction } from '$/types/Utility.js';

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
  url = url.startsWith('/') ? url : `/${url}`;
  url = `${favroApiBaseUrl}${url}`;
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

export type Logger = {
  log?: AnyFunction;
  error: AnyFunction;
  info: AnyFunction;
  trace?: AnyFunction;
  warn: AnyFunction;
};

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

  private _logger: Logger;

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
      logger?: Logger;
      /** Optionally use a custom Error class */
      error?: typeof BravoError;
    },
  ) {
    this.error = extendedOptions?.error || BravoError;
    this._logger = extendedOptions?.logger || console;
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
      total: this._requestsMade,
      remaining: this._requestsRemaining,
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
    this.assert(
      this._organizationId || !options?.requireOrganizationId,
      'An organizationId must be set for this request',
    );
    const method = options?.method || 'get';
    throwIfBodyAndMethodIncompatible(method, options?.body);
    // Ensure initial slash
    url = createFavroApiUrl(url, options?.query);
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
    const rawResponse = await (customFetch || this._fetch)(url, {
      method,
      headers, // Force it to assume no undefineds
      body,
    });
    const res = new FavroResponse<Data, this>(this, rawResponse);
    this._backendId = res.backendId || this._backendId;
    this._limitResetsAt = res.limitResetsAt;
    this._requestsLimit = res.limit;
    this._requestsRemaining = res.requestsRemaining;

    if (this._requestsRemaining < 1 || res.status == 429) {
      // TODO: Set an interval before allowing requests to go through again, OR SOMETHING
      this._requestsRemaining = 0;
      this._logger.warn(
        `Favro API rate limit reached! ${JSON.stringify(
          {
            status: res.status,
            remaining: this._requestsRemaining,
            made: this._requestsMade,
            limit: res.limit,
            resetAt: this._limitResetsAt,
          },
          null,
          2,
        )}`,
      );
    }
    if (res.status > 299) {
      this._logger.error(`Favro API Error: ${res.status}`, {
        url,
        method,
        body: await rawResponse.text(),
      });
    }
    this.assert(res.status < 300, `Failed with status ${res.status}`);
    const parsedBody = await res.getParsedBody();
    if (
      parsedBody &&
      typeof parsedBody != 'string' &&
      'message' in parsedBody
    ) {
      // @ts-expect-error
      const message = parsedBody.message;
      throw new BravoError(
        `Unexpected combo of status code (${res.status}) and response body ("${message}")`,
      );
    }
    return res;
  }
}
