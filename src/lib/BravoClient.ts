import { assertBravoClaim } from './errors.js';
import { BravoClientCache } from './clientLib/BravoClientCache.js';
import { BravoResponseEntities } from './clientLib/BravoResponse.js';
import { FavroClient, OptionsFavroRequest } from './clientLib/FavroClient.js';
import {
  findByField,
  findRequiredByField,
  stringsMatchIgnoringCase,
} from './utility.js';
import { BravoCollection } from './entities/BravoCollection';
import { BravoUser } from '$entities/users';
import { BravoOrganization } from '$entities/BravoOrganization';
import { BravoWidget } from '$entities/BravoWidget.js';
import type { DataFavroWidget } from '$/types/FavroWidgetTypes.js';
import type {
  OptionFavroCollectionVisibility,
  OptionFavroCollectionColorBackground,
  OptionFavroCollectionRole,
  DataAnyEntity,
  ConstructorFavroEntity,
} from '$/types/FavroApiTypes';
import type { OptionsBravoCreateWidget } from '$/types/ParameterOptions.js';

export class BravoClient extends FavroClient {
  //#region Organizations
  private cache = new BravoClientCache();

  private async requestWithReturnedEntities<EntityData extends DataAnyEntity>(
    url: string,
    options: OptionsFavroRequest,
    entityClass: ConstructorFavroEntity<EntityData>,
  ) {
    const res = await this.request<EntityData>(url, options);
    return new BravoResponseEntities(this, entityClass, res);
  }

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
      const res = await this.requestWithReturnedEntities(
        'organizations',
        {
          excludeOrganizationId: true,
        },
        BravoOrganization,
      );
      this.cache.organizations =
        (await res.getAllEntities()) as BravoOrganization[];
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
      const res = await this.requestWithReturnedEntities(
        'users',
        { method: 'get' },
        BravoUser,
      );
      this.cache.users = (await res.getAllEntities()) as BravoUser[];
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
    const res = await this.requestWithReturnedEntities(
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
      BravoCollection,
    );
    const collection = (await res.getAllEntities())[0] as
      | BravoCollection
      | undefined;
    assertBravoClaim(collection, `Failed to create collection`);
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
      const res = await this.requestWithReturnedEntities(
        'collections',
        { method: 'get' },
        BravoCollection,
      );
      this.cache.collections =
        (await res.getAllEntities()) as BravoCollection[];
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
      const res = await this.requestWithReturnedEntities(
        `collections/${collectionId}`,
        { method: 'get' },
        BravoCollection,
      );
      const collections = await res.getAllEntities();
      assertBravoClaim(
        collections.length == 1,
        `No collection found with id ${collectionId}`,
      );
      collection = collections[0] as BravoCollection;
    }
    return collection;
  }

  //#endregion

  //#region Widgets

  /**
   * Get the Widgets from the organization as an async generator,
   * allowing you to loop over however many results you want without
   * having to exhaustively fetch all widgets (can reduce API calls).
   */
  private async getWidgetsAsyncGenerator(collectionId?: string) {
    const widgets = this.cache.getWidgets(collectionId);
    if (!widgets) {
      const res = (await this.requestWithReturnedEntities(
        'widgets',
        { method: 'get', query: { collectionId } },
        BravoWidget,
      )) as BravoResponseEntities<DataFavroWidget, BravoWidget>;
      this.cache.addWidgets(res, collectionId);
    }
    return this.cache.getWidgets(collectionId)!;
  }

  /**
   * Create a new widget in a collection.
   *
   * {@link https://favro.com/developer/#create-a-widget}
   */
  async createWidget(
    collectionId: string,
    name: string,
    options?: OptionsBravoCreateWidget,
  ) {
    const res = await this.requestWithReturnedEntities(
      `widgets`,
      {
        method: 'post',
        body: {
          collectionId,
          name,
          type: options?.type || 'backlog',
          color: options?.color || 'cyan',
        },
      },
      BravoWidget,
    );
    const widget = (await res.getAllEntities())[0] as BravoWidget | undefined;
    assertBravoClaim(widget, `Failed to create widget`);
    return widget;
  }

  /**
   * Get list of all widgets, globally or by collection.
   * Specify the collection for faster results and
   * fewer API calls. Uses the `.getWidgetsPager()` cache.
   */
  async listWidgets(collectionId?: string) {
    const pager = await this.getWidgetsAsyncGenerator(collectionId);
    const widgets = ((await pager?.getAllEntities()) || []) as BravoWidget[];
    return widgets;
  }

  async findWidgetById(widgetCommonId: string) {
    const res = await this.requestWithReturnedEntities(
      `widgets/${widgetCommonId}`,
      { method: 'get' },
      BravoWidget,
    );
    const [widget] = await res.getAllEntities();
    return widget as BravoWidget;
  }

  /**
   * Find the first widget for which the `matchFunction` returns a truthy value.
   * Specifying a collection is recommended to reduce API calls. API calls caused
   * by the search are cached.
   */
  async findWidget(
    matchFunction: (widget: BravoWidget, idx?: number) => any,
    collectionId = '',
  ) {
    // Reduce API calls by non-exhaustively searching (when possible)
    const widgets = await this.getWidgetsAsyncGenerator(collectionId);
    return await widgets.find(matchFunction);
  }

  /**
   * Find the first widget found matching a given name.
   * Ignores case by default.
   *
   * Results are cached. Specifying a collectionId is
   * recommended to reduce API calls.
   *
   * *Note that Favro does not
   * require unique Widget names: you'll need to ensure
   * that yourself or restrict searches to collections
   * containing only one widget matching the given name.*
   */
  async findWidgetByName(
    name: string,
    collectionId?: string,
    options?: {
      matchCase?: boolean;
    },
  ) {
    // Reduce API calls by non-exhaustively searching (when possible)
    return await this.findWidget(
      (widget) =>
        options?.matchCase
          ? widget.name == name
          : stringsMatchIgnoringCase(name, widget.name),
      collectionId,
    );
  }

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
