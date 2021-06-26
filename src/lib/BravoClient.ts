import { assertBravoClaim } from './errors.js';
import {
  DataFavroUser,
  DataFavroCollection,
  OptionFavroCollectionVisibility,
  OptionFavroCollectionColorBackground,
  OptionFavroCollectionRole,
} from '../types/FavroApiTypes';
import {
  findByField,
  findRequiredByField,
  stringsMatchIgnoringCase,
} from './utility.js';
import { FavroCollection } from './FavroCollection';
import { FavroUser } from './FavroUser';
import { FavroOrganization } from './FavroOrganization';
import { FavroClient } from './clientLib/FavroClient.js';
import { BravoClientCache } from './clientLib/BravoClientCache.js';

export class BravoClient extends FavroClient {
  //#region Organizations
  private cache = new BravoClientCache();

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
    if (!this.cache.organizations) {
      const res = await this.request(
        'organizations',
        {
          excludeOrganizationId: true,
        },
        FavroOrganization,
      );
      this.cache.organizations = res.entities as FavroOrganization[];
    }
    return this.cache.organizations;
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
    if (!this.cache.users) {
      const res = await this.request<DataFavroUser>(
        'users',
        { method: 'get' },
        FavroUser,
      );
      this.cache.users = res.entities as FavroUser[];
    }
    return this.cache.users;
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

  async findUserByName(name: string) {
    return findRequiredByField(await this.listFullUsers(), 'name', name, {
      ignoreCase: true,
    });
  }

  async findUserByEmail(email: string) {
    return findRequiredByField(await this.listFullUsers(), 'email', email, {
      ignoreCase: true,
    });
  }

  async findUserById(userId: string) {
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
    this.cache.addCollection(collection);
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
    this.cache.removeCollection(collectionId);
  }

  /**
   * Collection names aren't required to be unique. This
   * method will delete *all* collections matching the name
   * provided. **Warning** case insensitive matching is used!
   */
  async deleteCollectionsByName(name: string) {
    const collections = await this.findCollectionsByName(name);
    for (const collection of collections) {
      await this.deleteCollectionById(collection.collectionId);
    }
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
    if (!this.cache.collections) {
      const res = await this.request(
        'collections',
        { method: 'get' },
        FavroCollection,
      );
      this.cache.collections = res.entities as FavroCollection[];
    }
    return this.cache.collections;
  }

  /**
   * Find collections by name. Names are not required to be unique
   * for Favro Collections, so *all* matching Collections are returned.
   * {@link https://favro.com/developer/#get-a-collection}
   */
  async findCollectionsByName(name: string) {
    const collections = await this.listCollections();
    const matching = collections.filter((c) =>
      stringsMatchIgnoringCase(name, c.name),
    );
    return matching;
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
      this.cache.collections || [],
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

  //#region Widgets

  //#endregion

  /**
   * Clear all cached data. This is useful if you need to
   * ensure that data from your next requests are completely
   * up-to-date.
   */
  clearCache() {
    this.cache.clear();
  }
}
