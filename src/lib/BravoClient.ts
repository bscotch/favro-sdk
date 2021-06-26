import { assertBravoClaim, BravoError } from './errors.js';
import fetch from 'node-fetch';
import { URL } from 'url';
import {
  DataAnyEntity,
  OptionFavroHttpMethod,
  DataFavroUser,
  DataFavroCollection,
  ConstructorFavroEntity,
  OptionFavroCollectionVisibility,
  DataFavroResponse,
  OptionFavroCollectionColorBackground,
  OptionFavroCollectionRole,
} from '../types/FavroApi';
import { FavroResponse, FavroResponseEntities } from './FavroResponse';
import { findByField, findRequiredByField } from './utility.js';
import { FavroCollection } from './FavroCollection';
import { FavroUser } from './FavroUser';
import { FavroOrganization } from './FavroOrganization';
import { FavroEntity } from './FavroEntity.js';

export interface OptionsBravoRequest {
  method?: OptionFavroHttpMethod | Capitalize<OptionFavroHttpMethod>;
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

  private _organizations?: FavroOrganization[];
  private _users?: FavroUser[];
  private _collections?: FavroCollection[];

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
      Host: 'favro.com', // Required by API (otherwise fails without explanation)
      'Content-Type': contentType!,
      ...options?.headers,
      ...this.authHeader,
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
    const res = await fetch(fullUrl.toString(), {
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
      this,
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

  //#region Organizations

  async currentOrganization() {
    if (!this._organizationId) {
      return;
    }
    return findByField(
      await this.listOrganizations(),
      'organizationId',
      this._organizationId,
    );
  }

  /**
   * List the calling user's organizations
   */
  async listOrganizations() {
    if (!this._organizations) {
      const res = await this.request(
        'organizations',
        {
          excludeOrganizationId: true,
        },
        FavroOrganization,
      );
      this._organizations = res.entities as FavroOrganization[];
    }
    return [...this._organizations];
  }

  async findOrganizationByName(name: string) {
    return findRequiredByField(await this.listOrganizations(), 'name', name, {
      ignoreCase: true,
    });
  }

  async findOrganizationById(organizationId: string) {
    return findRequiredByField(
      await this.listOrganizations(),
      'organizationId',
      organizationId,
    );
  }

  /**
   * The organizationId is required for most API calls.
   * Easily set the client's organizationId based on the
   * org's name.
   */
  async setOrganizationIdByName(organizationName: string) {
    const org = await this.findOrganizationByName(organizationName);
    assertBravoClaim(org.organizationId, `Org does not have an ID`);
    this.organizationId = org.organizationId;
  }

  //#endregion

  //#region Users

  /**
   * Full user info for the org (includes emails and names).
   */
  async listFullUsers() {
    const org = await this.currentOrganization();
    assertBravoClaim(org, 'Organization not set');
    if (!this._users) {
      const res = await this.request<DataFavroUser>(
        'users',
        { method: 'get' },
        FavroUser,
      );
      this._users = res.entities as FavroUser[];
    }
    return [...this._users];
  }

  /**
   * Basic user info (just userIds and org roles) obtained directly
   * from organization data.
   */
  async listOrganizationMembers() {
    const org = await this.currentOrganization();
    assertBravoClaim(org, 'Organization not set');
    return org.sharedToUsers;
  }

  async findFullUserByName(name: string) {
    return findRequiredByField(await this.listFullUsers(), 'name', name, {
      ignoreCase: true,
    });
  }

  async findFullUserByEmail(email: string) {
    return findRequiredByField(await this.listFullUsers(), 'email', email, {
      ignoreCase: true,
    });
  }

  async findFullUserById(userId: string) {
    return findRequiredByField(await this.listFullUsers(), 'userId', userId);
  }

  /** Find a user's basic info (userId & role) in this org, by ID. */
  async findOrganizationMemberById(userId: string) {
    return findRequiredByField(
      await this.listOrganizationMembers(),
      'userId',
      userId,
    );
  }

  //#endregion

  //#region Collections

  /**
   * Create a new collection. Currently uses only the
   * most essential parameters for simplicity. Sharing
   * defaults to 'organization' if not provided.
   *
   * {@link https://favro.com/developer/#create-a-collection}
   */
  async createCollection(
    name: string,
    options?: {
      publicSharing?: OptionFavroCollectionVisibility;
      background?: OptionFavroCollectionColorBackground;
      sharedToUsers?: {
        email?: string;
        userId?: string;
        role: OptionFavroCollectionRole;
      }[];
    },
  ) {
    const res = await this.request(
      'collections',
      {
        method: 'post',
        body: {
          name,
          publicSharing: options?.publicSharing || 'organization',
          // background: options?.background || 'blue',
          // sharedToUsers: [
          //   ...(options?.sharedToUsers || []),
          //   { email: this._userEmail, role: 'admin' },
          // ],
        },
      },
      FavroCollection,
    );
    const collection = res.entities[0] as FavroCollection | undefined;
    assertBravoClaim(
      collection,
      `Failed to create collection with status: ${res.status}`,
    );
    this._addCollectionToCache(collection);
    return collection;
  }

  async deleteCollectionById(collectionId: string) {
    const res = await this.request(`collections/${collectionId}`, {
      method: 'delete',
    });
    assertBravoClaim(
      res.succeeded,
      `Failed to delete collection with status ${res.status}`,
    );
    this._removeCollectionFromCache(collectionId);
  }

  /**
   * Add a collection to the cache *if the cache already exists*,
   * e.g. for updating it after creating a new collection. Ensures
   * uniqueness. If the collection is already in the cache, it
   * will be replaced by the one provided in this call (e.g. for
   * replacing the cached copy with an updated one).
   */
  private _addCollectionToCache(collection: FavroCollection) {
    if (!this._collections) {
      return;
    }
    const cachedIdx = this._collections.findIndex(
      (c) => c.collectionId == collection.collectionId,
    );
    if (cachedIdx > -1) {
      this._collections.splice(cachedIdx, 1, collection);
    } else {
      this._collections.push(collection);
    }
  }

  /**
   * May need to remove a collection from the cache, e.g. after
   * a deletion triggered locally.
   */
  private _removeCollectionFromCache(collectionId: string) {
    const cachedIdx = this._collections?.findIndex(
      (c) => c.collectionId == collectionId,
    );
    if (typeof cachedIdx == 'number' && cachedIdx > -1) {
      this._collections!.splice(cachedIdx, 1);
    }
  }

  async deleteCollectionByName(name: string) {
    const collection = await this.findCollectionByName(name);
    assertBravoClaim(collection, `Could not find collection with name ${name}`);
    await this.deleteCollectionById(collection.collectionId);
  }

  /**
   * Fetch *all* collections from the current org.
   * Returns the cached result of the first call until
   * the cache is cleared.
   * (Does not include archived)
   * {@link https://favro.com/developer/#get-all-collections}
   */
  async listCollections() {
    const org = await this.currentOrganization();
    assertBravoClaim(org, 'Organization not set');
    if (!this._collections) {
      const res = await this.request(
        'collections',
        { method: 'get' },
        FavroCollection,
      );
      this._collections = res.entities as FavroCollection[];
    }
    return [...this._collections];
  }

  /**
   * Look for a specific collection by name, which requires
   * fetching *all* collections. Checks the cache first.
   * {@link https://favro.com/developer/#get-a-collection}
   */
  async findCollectionByName(name: string) {
    return findRequiredByField(await this.listCollections(), 'name', name, {
      ignoreCase: true,
    });
  }

  /**
   * Look for a specific collection by ID, first in the
   * cached collections and falling back to the single-collection
   * endpoint.
   * {@link https://favro.com/developer/#get-a-collection}
   */
  async findCollectionById(collectionId: string) {
    // See if already in the cache
    let collection = findByField(
      this._collections || [],
      'collectionId',
      collectionId,
    );
    if (!collection) {
      // Then hit the API directly!
      const res = await this.request<DataFavroCollection>(
        `collections/${collectionId}`,
        { method: 'get' },
        FavroCollection,
      );
      assertBravoClaim(
        res.entities.length == 1,
        `No collection found with id ${collectionId}`,
      );
      collection = res.entities[0] as FavroCollection;
    }
    return collection;
  }

  //#endregion

  /**
   * To reduce API calls (the rate limits are tight), things
   * are generally cached. To ensure requests are up to date
   * with recent changes, you can force a cache clear.
   */
  clearCache() {
    this._users = undefined;
    this._organizations = undefined;
    this._collections = undefined;
  }

  static toBase64(string: string) {
    return Buffer.from(string).toString('base64');
  }
}
