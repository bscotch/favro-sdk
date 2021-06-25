import { assertBravoClaim, BravoError } from './errors.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import {
  AnyEntity,
  FavroResponseData,
  FavroApiMethod,
  FavroDataOrganization,
  FavroDataOrganizationUser,
} from '../types/FavroApi';
import { FavroResponse } from './FavroResponse';
import { stringsMatchIgnoringCase } from './utility.js';

type FavroDataOrganizationUserPartial =
  FavroDataOrganization['sharedToUsers'][number];

export class FavroUser<
  Data extends FavroDataOrganizationUser | FavroDataOrganizationUserPartial,
> {
  private _data: Data;
  constructor(data: Data) {
    this._data = data;
  }

  get userId() {
    return this._data.userId;
  }

  get role() {
    return 'organizationRole' in this._data
      ? this._data.organizationRole
      : this._data.role;
  }

  get name(): Data extends FavroDataOrganizationUser ? string : undefined {
    // @ts-expect-error
    return 'name' in this._data ? this._data.name : undefined;
  }

  get email(): Data extends FavroDataOrganizationUser ? string : undefined {
    // @ts-expect-error
    return 'email' in this._data ? this._data.email : undefined;
  }
}

export class BravoClient {
  static readonly baseUrl = 'https://favro.com/api/v1';

  private _token!: string;
  private _organizationId?: string;
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

  private _organizations?: FavroDataOrganization[];

  private _users?: FavroUser<FavroDataOrganizationUser>[];

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

  get organizationId() {
    return this._organizationId;
  }
  set organizationId(organizationId: string | undefined) {
    if (this._organizationId && this._organizationId != organizationId) {
      this.clearCache();
    }
    this._organizationId = organizationId;
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
  async request<Entity extends AnyEntity = AnyEntity>(
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
      excludeOrganizationId?: boolean;
      requireOrganizationId?: boolean;
    },
  ) {
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
    url = url.startsWith('/') ? url : `/${url}`;
    url = `${BravoClient.baseUrl}${url}`;
    const fullUrl = new URL(url);
    if (options?.query) {
      for (const param of Object.keys(options.query)) {
        fullUrl.searchParams.append(param, options.query[param]);
      }
    }
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
      'Content-Type': contentType!,
      ...options?.headers,
      ...this.authHeader,
      'User-Agent': `BravoClient <https://github.com/bscotch/favro-sdk>`,
      organizationId: options?.excludeOrganizationId
        ? undefined
        : this._organizationId,
      'X-Favro-Backend-Identifier': options?.backendId || this._backendId!,
    };
    const res = await fetch(fullUrl.toString(), {
      method,
      headers: headers as Record<string, string>, // Force it to assume no undefineds
      body: options?.body,
    });
    const favroRes = new FavroResponse(
      res,
      (await res.json()) as FavroResponseData<Entity>,
    );
    this._limitResetsAt = favroRes.limitResetsAt;
    this._requestsRemaining = favroRes.requestsRemaining;
    if (this._requestsRemaining < 1 || res.status == 429) {
      // TODO: Set an interval before allowing requests to go through again, OR SOMETHING
      this._requestsRemaining = 0;
    }
    return favroRes;
  }

  async currentOrganization() {
    if (!this._organizationId) {
      return;
    }
    return (await this.listOrganizations()).find(
      (org) => org.organizationId == this._organizationId,
    );
  }

  /**
   * List the calling user's organizations
   */
  async listOrganizations() {
    if (!this._organizations) {
      const res = await this.request<FavroDataOrganization>('organizations', {
        excludeOrganizationId: true,
      });
      this._organizations = res.entities;
    }
    return [...this._organizations];
  }

  async findOrganizationByName(name: string) {
    const orgs = await this.listOrganizations();
    return orgs.find((org) => org.name);
  }

  async setOrganizationIdByName(organizationName: string) {
    const org = await this.findOrganizationByName(organizationName);
    assertBravoClaim(org, `Org by name of ${organizationName} not found`);
    assertBravoClaim(org.organizationId, `Org does not have an ID`);
    this.organizationId = org.organizationId;
  }

  /**
   * Full user info for the org (includes emails and names),
   * requires an API request.
   */
  async listFullUsers() {
    const org = await this.currentOrganization();
    assertBravoClaim(org, 'Organization not set');
    if (!this._users) {
      const res = await this.request<FavroDataOrganizationUser>('users');
      this._users = res.entities.map((u) => new FavroUser(u));
    }
    return [...this._users];
  }

  /**
   * Basic user info (just userIds and roles) obtained directly
   * from organization data (doesn't require an API request)
   */
  async listPartialUsers() {
    const org = await this.currentOrganization();
    assertBravoClaim(org, 'Organization not set');
    const users = org.sharedToUsers.map((u) => new FavroUser(u));
    return users;
  }

  async findFullUserByName(name: string) {
    const users = await this.listFullUsers();
    return users.find((u) => stringsMatchIgnoringCase(name, u.name));
  }

  async findFullUserByEmail(email: string) {
    const users = await this.listFullUsers();
    return users.find((u) => stringsMatchIgnoringCase(email, u.email));
  }

  async findFullUserById(userId: string) {
    const users = await this.listFullUsers();
    return users.find((u) => userId == u.userId);
  }

  async findPartialUserById(userId: string) {
    const users = await this.listPartialUsers();
    return users.find((u) => userId == u.userId);
  }

  /**
   * To reduce API calls (the rate limits are tight), things
   * are generally cached. To ensure requests are up to date
   * with recent changes, you can force a cache clear.
   */
  clearCache() {
    this._users = undefined;
    this._organizations = undefined;
  }

  static toBase64(string: string) {
    return Buffer.from(string).toString('base64');
  }
}
