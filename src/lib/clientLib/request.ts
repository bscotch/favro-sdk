import { assertBravoClaim, BravoError } from '@/errors.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import type {
  DataAnyEntity,
  ConstructorFavroEntity,
  DataFavroResponse,
} from '$/types/FavroApi';
import { FavroResponse, FavroResponseEntities } from '@/FavroResponse';
import type { BravoClient, OptionsBravoRequest } from '@/BravoClient.js';
import { toBase64 } from '@/utility.js';
import type { FavroEntity } from '@/FavroEntity.js';

export const favroApiBaseUrl = 'https://favro.com/api/v1';

export function createFavroApiUrl(
  url: string,
  params?: Record<string, string>,
) {
  // Ensure initial slash
  url = url.startsWith('/') ? url : `/${url}`;
  url = `${favroApiBaseUrl}${url}`;
  const fullUrl = new URL(url);
  if (params) {
    for (const param of Object.keys(params)) {
      fullUrl.searchParams.append(param, params[param]);
    }
  }
  return fullUrl.toString();
}

export function createBasicAuthHeader(username: string, password: string) {
  const encodedCredentials = toBase64(`${username}:${password}`);
  return {
    Authorization: `Basic ${encodedCredentials}`,
  };
}

// TODO: Put this into a base class!

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
  protected _requestsRemaining?: number;
  protected _limitResetsAt?: Date;
  private _backendId?: string;

  constructor(options?: {
    token?: string;
    organizationId?: string;
    userEmail?: string;
  }) {
    for (const [optionsName, envName] of [
      ['token', 'FAVRO_TOKEN'],
      ['userEmail', 'FAVRO_USER_EMAIL'],
    ] as const) {
      const value = options?.[optionsName] || process.env[envName];
      assertBravoClaim(value, `A Favro ${optionsName} is required.`);
      this[`_${optionsName}`] = value;
    }
    this._organizationId =
      options?.organizationId || process.env.FAVRO_ORGANIZATION_ID;
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
  async request(
    url: string,
    options?: OptionsBravoRequest,
  ): Promise<FavroResponse>;
  async request<EntityData extends DataAnyEntity>(
    url: string,
    options: OptionsBravoRequest,
    entityClass: ConstructorFavroEntity<EntityData>,
  ): Promise<FavroResponseEntities<EntityData, FavroEntity<EntityData>>>;
  async request<EntityData extends DataAnyEntity>(
    url: string,
    options?: OptionsBravoRequest,
    entityClass?: ConstructorFavroEntity<EntityData>,
  ): Promise<any> {
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
    if (['get', 'delete'].includes(method) && options?.body) {
      throw new BravoError(`HTTP Bodies not allowed for ${method} method`);
    }
    // Ensure initial slash
    url = createFavroApiUrl(url, options?.query);
    let body = options?.body;
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
    const headers = {
      Host: 'favro.com', // Required by API (otherwise fails without explanation)
      'Content-Type': contentType!,
      ...options?.headers,
      ...createBasicAuthHeader(this._userEmail, this._token),
      'User-Agent': `BravoClient <https://github.com/bscotch/favro-sdk>`,
      organizationId: options?.excludeOrganizationId
        ? undefined
        : this._organizationId,
      'X-Favro-Backend-Identifier': options?.backendId || this._backendId!,
    };
    const cleanHeaders = Object.keys(headers).reduce((acc, header: string) => {
      // @ts-expect-error
      if (typeof headers[header] == 'undefined') {
        return acc;
      }
      // @ts-expect-error
      acc[header] = `${headers[header]}`;
      return acc;
    }, {} as Record<string, string>);
    const res = await fetch(url, {
      method,
      headers: cleanHeaders, // Force it to assume no undefineds
      body,
    });
    this._backendId =
      res.headers.get('X-Favro-Backend-Identifier') || this._backendId;
    if (!entityClass) {
      return new FavroResponse(res);
    }
    assertBravoClaim(res.status < 300, `Failed with status ${res.status}`);
    let responseBody: string | DataFavroResponse<EntityData> = (
      await res.buffer()
    ).toString('utf8');
    assertBravoClaim(
      res.headers.get('Content-Type')?.startsWith('application/json'),
      'Response type is not JSON, cannot be wrapped in Entity class.',
    );
    try {
      responseBody = JSON.parse(responseBody) as DataFavroResponse<EntityData>;
    } catch {
      throw new BravoError(`Could not JSON-parse: ${responseBody.toString()}`);
    }
    const favroRes = new FavroResponseEntities(
      responseBody,
      entityClass,
      this as unknown as BravoClient,
      res,
    );
    this._limitResetsAt = favroRes.limitResetsAt;
    this._requestsRemaining = favroRes.requestsRemaining;
    if (this._requestsRemaining < 1 || res.status == 429) {
      // TODO: Set an interval before allowing requests to go through again, OR SOMETHING
      this._requestsRemaining = 0;
    }
    return favroRes;
  }
}
