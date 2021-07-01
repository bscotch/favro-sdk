import { assertBravoClaim, BravoError } from '@/errors.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import type {
  DataAnyEntity,
  OptionFavroHttpMethod,
} from '$/types/FavroApiTypes';
import { FavroResponse } from '@/clientLib/FavroResponse';
import { toBase64 } from '@/utility.js';

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
      fullUrl.searchParams.set(param, params[param]);
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

export class FavroClient {
  protected _token!: string;
  protected _organizationId?: string;
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
  protected _limitResetsAt?: Date;
  private _backendId?: string;

  constructor(options?: {
    token?: string;
    organizationId?: string;
    userEmail?: string;
  }) {
    for (const [optionsName, envName, optional] of [
      ['token', 'FAVRO_TOKEN'],
      ['userEmail', 'FAVRO_USER_EMAIL'],
      ['organizationId', 'FAVRO_ORGANIZATION_ID', true],
    ] as const) {
      const value = options?.[optionsName] || process.env[envName];
      if (!value && optional) {
        continue;
      }
      assertBravoClaim(value, `A Favro ${optionsName} is required.`);
      this[`_${optionsName}` as const] = value;
    }
  }

  // @ts-expect-error
  get organizationId(): string | undefined {
    return this._organizationId;
  }
  /**
   * Set the organizationID **if it isn't already set**
   */
  set organizationId(organizationId: string) {
    if (this._organizationId && this._organizationId != organizationId) {
      throw new BravoError(`Cannot reset clientId once it has been set.`);
    }
    this._organizationId = organizationId;
  }

  /**
   * General API request function against Favro's HTTP API {@link https://favro.com/developer/}.
   * Defaults to a GET request. Default headers are automatically handled.
   *
   * @param url Relative to the base URL {@link https://favro.com/api/v1}
   */
  async request<EntityData extends DataAnyEntity | null = null>(
    url: string,
    options?: OptionsFavroRequest,
  ): Promise<FavroResponse<EntityData, this>> {
    assertBravoClaim(
      typeof this._requestsRemaining == 'undefined' ||
        this._requestsRemaining > 0,
      'No requests remaining!',
    );
    assertBravoClaim(
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
    const res = new FavroResponse<EntityData, this>(
      this,
      await fetch(url, {
        method,
        headers, // Force it to assume no undefineds
        body,
      }),
    );
    this._backendId = res.backendId || this._backendId;
    this._limitResetsAt = res.limitResetsAt || this._limitResetsAt;
    this._requestsRemaining =
      typeof res.requestsRemaining == 'number'
        ? res.requestsRemaining
        : this._requestsRemaining;

    if (this._requestsRemaining < 1 || res.status == 429) {
      // TODO: Set an interval before allowing requests to go through again, OR SOMETHING
      this._requestsRemaining = 0;
    }
    assertBravoClaim(res.status < 300, `Failed with status ${res.status}`);
    return res;
  }
}
