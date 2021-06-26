import { assertBravoClaim } from './errors.js';
import {
  OptionFavroHttpMethod,
  DataFavroUser,
  DataFavroCollection,
  OptionFavroCollectionVisibility,
  OptionFavroCollectionColorBackground,
  OptionFavroCollectionRole,
} from '../types/FavroApi';
import { findByField, findRequiredByField } from './utility.js';
import { FavroCollection } from './FavroCollection';
import { FavroUser } from './FavroUser';
import { FavroOrganization } from './FavroOrganization';
import { FavroClient } from './clientLib/request.js';

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

export class BravoClient extends FavroClient {
  private _organizations?: FavroOrganization[];
  private _users?: FavroUser[];
  private _collections?: FavroCollection[];

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
}
