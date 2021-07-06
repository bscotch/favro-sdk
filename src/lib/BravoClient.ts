import { assertBravoClaim } from './errors.js';
import { BravoClientCache } from './clientLib/BravoClientCache.js';
import {
  BravoResponseEntities,
  BravoResponseEntitiesMatchFunction,
} from './clientLib/BravoResponse.js';
import { FavroClient, OptionsFavroRequest } from './clientLib/FavroClient.js';
import {
  find,
  findByField,
  findRequiredByField,
  stringsMatch,
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
import { BravoColumn } from './entities/BravoColumn.js';
import { DataFavroColumn } from '$/types/FavroColumnTypes.js';
import { ArrayMatchFunction } from '$/types/Utility.js';
import {
  DataFavroCard,
  FavroApiGetCardsParams,
  FavroApiParamsCardCreate,
} from '$/types/FavroCardTypes.js';
import { BravoCard } from './entities/BravoCard.js';
import { BravoCustomField } from './entities/BravoCustomField.js';
import { DataFavroCustomField } from '$/types/FavroCustomFieldTypes.js';

/**
 * The `BravoClient` class should be singly-instanced for a given
 * set of credentials and a target organization. Once the organizationId
 * is set (either out of the gate via env var or construct args, or
 * by using `client.setOrganizationIdByName` when the org name is known
 * but the id is not).
 *
 * All Favro API fetching and caching is centralized and managed in
 * this class. "Entities" returned from Favro API endpoints are wrapped
 * in per-type class instances, providing shortcuts to many of the methods
 * here.
 *
 * Entities store their raw data, as originally fetched from Favro,
 * available via the `.toJSON()` method (this method is automatically
 * used by JSON.stringify(), allowing you to use that general function
 * to get the raw data back). Note that the raw data
 * **does not necessarily get updated** by Bravo when things are mutated.
 *
 * @example
 * const client = new BravoClient();
 * await client.setOrganizationIdByName('my-org');
 * const newCollection = await client.createCollection('My New Collection');
 * await newCollection.delete();
 * // ^^ shortcut for `await client.deleteCollection(newCollection.collectionId)`
 */
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
    const collection = (await res.getFirstEntity()) as BravoCollection;
    assertBravoClaim(collection, `Failed to create collection`);
    this.cache.addCollection(collection);
    return collection;
  }

  async deleteCollectionById(collectionId: string) {
    await this.deleteEntity(`collections/${collectionId}`);
    this.cache.removeCollection(collectionId);
  }

  /**
   * Delete the first collection found by matching against
   * a name.
   */
  async deleteCollectionByName(
    ...args: Parameters<BravoClient['findCollectionByName']>
  ) {
    const collection = await this.findCollectionByName(...args);
    return await collection?.delete();
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
   * Find a collection by name. Names are not required to be unique
   * by Favro -- only the first match is returned.
   * {@link https://favro.com/developer/#get-a-collection}
   */
  async findCollectionByName(name: string, options?: { ignoreCase?: boolean }) {
    return findByField(await this.listCollections(), 'name', name, options);
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
      collection = (await res.getFirstEntity()) as BravoCollection;
      assertBravoClaim(
        collection,
        `No collection found with id ${collectionId}`,
      );
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
      this.cache.setWidgets(res, collectionId);
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
          type: options?.type || 'board',
          color: options?.color || 'cyan',
        },
      },
      BravoWidget,
    );
    const widget = (await res.getFirstEntity()) as BravoWidget;
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
    matchFunction: BravoResponseEntitiesMatchFunction<BravoWidget>,
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
      ignoreCase?: boolean;
    },
  ) {
    // Reduce API calls by non-exhaustively searching (when possible)
    return await this.findWidget(
      (widget) => stringsMatch(name, widget.name, options),
      collectionId,
    );
  }

  async deleteWidgetById(widgetCommonId: string) {
    await this.deleteEntity(`widgets/${widgetCommonId}`);
  }
  //#endregion

  //#region COLUMNS

  /**
   * Create a new column on a Widget.
   * {@link https://favro.com/developer/#create-a-column}
   */
  async createColumn(
    widgetCommonId: string,
    name: string,
    options?: { position?: number },
  ) {
    const res = await this.requestWithReturnedEntities(
      `columns`,
      {
        method: 'post',
        body: {
          widgetCommonId,
          name,
          position: options?.position,
        },
      },
      BravoColumn,
    );
    const column = (await res.getFirstEntity()) as BravoColumn;
    assertBravoClaim(column, `Failed to create column`);
    this.cache.addColumn(widgetCommonId, column);
    return column;
  }

  async listColumns(widgetCommonId: string) {
    if (!this.cache.getColumns(widgetCommonId)) {
      const res = (await this.requestWithReturnedEntities(
        `columns`,
        { method: 'get', query: { widgetCommonId } },
        BravoColumn,
      )) as BravoResponseEntities<DataFavroColumn, BravoColumn>;
      const columns = await res.getAllEntities();
      this.cache.setColumns(widgetCommonId, columns);
    }
    return this.cache.getColumns(widgetCommonId)!;
  }

  /**
   * Find a column on a widget
   */
  async findColumn(
    widgetCommonId: string,
    matchFunction: ArrayMatchFunction<BravoColumn>,
  ) {
    return await find(await this.listColumns(widgetCommonId), matchFunction);
  }

  async deleteColumn(widgetCommonId: string, columnId: string) {
    // Note: technically we don't NEED the widgetId to delete a column,
    // but coupling these together is useful and allows for cache management.
    await this.deleteEntity(`columns/${columnId}`);
    this.cache.removeColumn(widgetCommonId, columnId);
  }

  //#endregion

  //#region

  /**
   * Create a new card
   *
   * {@link https://favro.com/developer/#create-a-card}
   */
  async createCard(data: FavroApiParamsCardCreate) {
    const res = await this.requestWithReturnedEntities(
      `cards`,
      {
        method: 'post',
        body: data,
      },
      BravoCard,
    );
    const card = (await res.getFirstEntity()) as BravoCard;
    assertBravoClaim(card, `Failed to create card`);
    return card;
  }

  /**
   * Fetch cards. **Note**: not cached! Cards are lazy-loaded
   * to reduce API calls.
   *
   * {@link https://favro.com/developer/#get-all-cards}
   */
  async listCards(options?: FavroApiGetCardsParams) {
    const res = (await this.requestWithReturnedEntities(
      `cards`,
      {
        method: 'get',
        query: {
          unique: true,
          descriptionFormat: 'markdown',
          ...options,
        } as FavroApiGetCardsParams,
      },
      BravoCard,
    )) as BravoResponseEntities<DataFavroCard, BravoCard>;
    return res;
  }

  /**
   * Delete a card by its *cardId* (not its *cardCommonId*!).
   * The cardId is associated with a single Widget. Optionally
   * delete the card *everywhere* instead of only the widget
   * in which it it has the given `cardId`
   *
   * {@link https://favro.com/developer/#delete-a-card}
   */
  async deleteCard(cardId: string, everywhere = false) {
    let url = `cards/${cardId}`;
    if (everywhere) {
      url += `?everywhere=true`;
    }
    await this.deleteEntity(url);
  }

  //#endregion

  //#region CUSTOM FIELDS

  /**
   * Get and cache *all* Custom Fields. Lazy-loaded to reduce
   * API calls.
   *
   * (The Favro API does not provide any filter options, so
   * Custom Fields can be obtained 1 at a time or 1 page at a time.)
   *
   * {@link https://favro.com/developer/#get-all-custom-fields}
   */
  async listCustomFields() {
    if (!this.cache.customFields) {
      const res = (await this.requestWithReturnedEntities(
        `customfields`,
        { method: 'get' },
        BravoCustomField,
      )) as BravoResponseEntities<DataFavroCustomField, BravoCustomField>;
      this.cache.customFields = res;
    }
    return this.cache.customFields!;
  }

  //#endregion

  private async deleteEntity(url: string) {
    const res = await this.request(url, {
      method: 'delete',
    });
    assertBravoClaim(
      res.succeeded,
      `Failed to delete entity at ${url}; Status: ${res.status}`,
    );
  }

  /**
   * Clear all cached data. This is useful if you need to
   * ensure that data from your next requests are completely
   * up-to-date.
   */
  clearCache() {
    this.cache.clear();
  }
}
