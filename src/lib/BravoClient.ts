import { assertBravoClaim, BravoError } from './errors.js';
import fetch, { Response } from 'node-fetch';
import { URL } from 'url';

type FavroApiMethod = 'get' | 'post' | 'put' | 'delete';

export class FavroResponse {
  private _response: Response;

  constructor(response: Response) {
    this._response = response;
  }

  get status() {
    return this._response.status;
  }

  get succeeded() {
    return this.status <= 399 && this.status >= 200;
  }

  get failed() {
    return this.succeeded;
  }

  get requestsRemaining() {
    return Number(this._response.headers.get('X-RateLimit-Remaining'));
  }

  get limitResetsAt() {
    return new Date(this._response.headers.get('X-RateLimit-Reset')!);
  }
}

export class BravoClient {
  static readonly baseUrl = 'https://favro.com/api/v1';

  private _token!: string;
  private _organizationId!: string;
  /**
   * Authentication requires the user's identifer (their email address)
   */
  private _userEmail!: string;
  /**
   * The response header X-RateLimit-Remaining informs how many
   * requests we can make before being blocked. Use this to ensure
   * we don't frequently hit those! X-RateLimit-Reset is the time
   * when the limit will be reset.
   */
  private _requestsRemaining?: number;
  private _limitResetsAt?: Date;
  /**
   * Favro responses include the header X-Favro-Backend-Identifier,
   * which is used to route to the same server. Required for paging.
   */
  private _backendId?: string;

  constructor(options: {
    token?: string;
    organizationId?: string;
    userEmail?: string;
  }) {
    for (const [optionsName, envName] of [
      ['token', 'FAVRO_TOKEN'],
      ['organizationId', 'FAVRO_ORGANIZATION_ID'],
      ['userEmail', 'FAVRO_USER_EMAIL'],
    ] as const) {
      const value = options?.[optionsName] || process.env[envName];
      assertBravoClaim(value, `A Favro ${optionsName} is required.`);
      this[`_${optionsName}`] = value;
    }
  }

  private get authHeader() {
    const encodedCredentials = BravoClient.toBase64(
      `${this._userEmail}:${this._token}`,
    );
    return {
      Authorization: `Basic ${encodedCredentials}`,
    };
  }

  /**
   * General API request function against Favro's HTTP API {@link https://favro.com/developer/}.
   * Defaults to a GET request. Default headers are automatically handled.
   *
   * @param url Relative to the base URL {@link https://favro.com/api/v1}
   */
  async request(
    url: string,
    options?: {
      method?: FavroApiMethod | Capitalize<FavroApiMethod>;
      query?: Record<string, string>;
      body?: any;
      headers?: Record<string, string>;
      /**
       * BravoClients use the last-received Backend ID by default,
       * but you can override this if necessary.
       */
      backendId?: string;
    },
  ) {
    const method = options?.method || 'get';
    if (['get', 'delete'].includes(method) && options?.body) {
      throw new BravoError(`HTTP Bodies not allowed for ${method} method`);
    }
    // Ensure initial slash
    url = url.startsWith('/') ? url : `/${url}`;
    url = `${BravoClient.baseUrl}${url}`;
    const fullUrl = new URL(url);
    if (options?.query) {
      for (const param of Object.keys(options.query)) {
        fullUrl.searchParams.append(param, options.query[param]);
      }
    }
    const res = new FavroResponse(
      await fetch(fullUrl.toString(), {
        method,
        headers: {
          ...options?.headers,
          ...this.authHeader,
          'User-Agent': `BravoClient <https://github.com/bscotch/favro-sdk>`,
          organizationId: this._organizationId,
          'X-Favro-Backend-Identifier': options?.backendId || this._backendId!,
        },
        body: options?.body,
      }),
    );
    this._limitResetsAt = res.limitResetsAt;
    this._requestsRemaining = res.requestsRemaining;
    return res;
  }

  static toBase64(string: string) {
    return Buffer.from(string).toString('base64');
  }
}
