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
  createIsMatchFilter,
  stringsMatch,
  generateRandomString,
  stringToNumber,
  wrapIfNotArray,
} from './utility.js';
import { BravoCollection } from './entities/BravoCollection';
import { BravoUser } from '$/lib/entities/BravoUser';
import { BravoOrganization } from '$entities/BravoOrganization';
import { BravoWidget } from '$entities/BravoWidget.js';
import { BravoColumn } from './entities/BravoColumn.js';
import type {
  ArrayMatchFunction,
  OneOrMore,
  PartialBy,
  RequiredBy,
} from '$/types/Utility.js';
import { BravoCardInstance } from './entities/BravoCard.js';
import { BravoCustomFieldDefinition } from './entities/BravoCustomField.js';
import type { FavroResponse } from './clientLib/FavroResponse.js';
import { readFileSync } from 'fs';
import { basename } from 'path';
import { BravoTagDefinition } from './entities/BravoTag.js';
import type { BravoEntity } from './BravoEntity.js';
import type { FavroApi } from '$types/FavroApi.js';
import { BravoWebhookDefinition } from './entities/BravoWebhook.js';
import { BravoGroup } from '$/types/Bravo.js';
import { DebugPath, DebugPathSetting, Logger } from './Logger.js';

export { FavroClientAuth as BravoClientAuth } from './clientLib/FavroClient.js';

type ConstructorFavroEntity<EntityData extends Record<string, any>> = new (
  client: BravoClient,
  data: EntityData,
) => BravoEntity<EntityData>;

/**
 * The `BravoClient` class should be singly-instanced for a given
 * set of credentials and a target organization.
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
 *
 * @public
 */
export class BravoClient extends FavroClient {
  //#region Organizations
  private cache = new BravoClientCache(this);

  private async requestWithReturnedEntities<
    EntityData extends Record<string, any>,
  >(
    url: string,
    options: OptionsFavroRequest,
    entityClass: ConstructorFavroEntity<EntityData>,
  ) {
    const res = await this.request<EntityData>(url, options);
    return new BravoResponseEntities(this, entityClass, res);
  }

  /**
   * Override any previous debugLogging settings
   * with a new set.
   */
  enableDebugLogging(debugNamespaces: OneOrMore<DebugPathSetting>) {
    Logger.enableDebug(wrapIfNotArray(debugNamespaces));
  }

  disableDebugLogging() {
    Logger.disableDebug();
  }

  /** Get the hydrated Organization model that this client is using. */
  async getCurrentOrganization() {
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

  //#endregion

  //#region Users

  /**
   * Full user info for the org (includes emails and names).
   */
  async listMembers() {
    const org = await this.getCurrentOrganization();
    this.assert(org, 'Organization not set');
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

  async findMember(match: (user: BravoUser) => any) {
    const members = await this.listMembers();
    return members.find((user) => match(user));
  }

  async findMemberByEmail(email: string | RegExp) {
    return await this.findMemberByField('email', email);
  }

  async findMemberByName(name: string | RegExp) {
    return await this.findMemberByField('name', name);
  }

  async findMemberByUserId(userId: string) {
    return await this.findMemberByField('userId', userId);
  }

  private async findMemberByField(
    field: 'email' | 'name' | 'userId',
    value: string | RegExp,
  ) {
    const user = await this.findMember(createIsMatchFilter(value, field));
    this.assert(user, `No user found with ${field} matching ${value}`);
    return user;
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
      publicSharing?: FavroApi.Collection.ModelFieldValue.Visibility;
      background?: FavroApi.Collection.ModelFieldValue.ColorBackground;
      sharedToUsers?: {
        email?: string;
        userId?: string;
        role: FavroApi.Collection.ModelFieldValue.Role;
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
    this.assert(collection, `Failed to create collection`);
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
   *
   * ???? https://favro.com/developer/#get-all-collections
   */
  async listCollections() {
    const org = await this.getCurrentOrganization();
    this.assert(org, 'Organization not set');
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

  /** Find a collection using a match function. */
  async findCollection(match: (collection: BravoCollection) => any) {
    return (await this.listCollections()).find((collection) =>
      match(collection),
    );
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
      this.assert(collection, `No collection found with id ${collectionId}`);
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
      )) as BravoResponseEntities<FavroApi.Widget.Model, BravoWidget>;
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
    options?: Omit<FavroApi.Widget.Create, 'collectionId'>,
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
    this.assert(widget, `Failed to create widget`);
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
   *
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
    this.assert(column, `Failed to create column`);
    this.cache.addColumn(widgetCommonId, column);
    return column;
  }

  /**
   * List the Columns (Statuses) attached to a Widget.
   * Results are cached by Widget.
   *
   * ???? https://favro.com/developer/#get-all-columns
   */
  async listColumns(widgetCommonId: string) {
    if (!this.cache.getColumns(widgetCommonId)) {
      const res = (await this.requestWithReturnedEntities(
        `columns`,
        { method: 'get', query: { widgetCommonId } },
        BravoColumn,
      )) as BravoResponseEntities<FavroApi.Column.Model, BravoColumn>;
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

  async findColumnById(
    columnCommonId: string,
  ): Promise<BravoColumn | undefined>;
  async findColumnById(
    widgetCommonId: string,
    columnId: string,
  ): Promise<BravoColumn | undefined>;
  async findColumnById(
    widgetOrColumnId: string,
    columnId?: string,
  ): Promise<BravoColumn | undefined> {
    const column = columnId
      ? await find(
          await this.listColumns(widgetOrColumnId),
          (col) => col.columnId == columnId,
        )
      : ((await (
          await this.requestWithReturnedEntities(
            `columns/${widgetOrColumnId}`,
            { method: 'get' },
            BravoColumn,
          )
        ).getFirstEntity()) as BravoColumn);
    this.assert(
      column,
      `Column with id ${columnId} does not exist on Widget with id ${widgetOrColumnId}`,
    );
    return column;
  }

  async deleteColumnById(widgetCommonId: string, columnId: string) {
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
  async createCard(data: FavroApi.Card.CreateBody) {
    const res = await this.requestWithReturnedEntities(
      `cards`,
      {
        method: 'post',
        body: data,
      },
      BravoCardInstance,
    );
    const card = (await res.getFirstEntity()) as BravoCardInstance;
    this.assert(card, `Failed to create card`);
    return card;
  }

  /**
   * Fetch cards. Filtering results by the narrowest
   * scope possible is a good idea to reduce API calls
   * and how many results are obtained.
   *
   * **Note**: not cached! Cards are lazy-loaded
   * to reduce API calls.
   *
   * {@link https://favro.com/developer/#get-all-cards}
   */
  async listCardInstances(options?: FavroApi.Card.SearchQuery) {
    // Clean up the sequentialId, if present, since it can come in
    // in multiple ways (as a URL, with a prefix, or plain)
    if (typeof options?.cardSequentialId == 'string') {
      options.cardSequentialId = stringToNumber(
        options.cardSequentialId.replace(/^.*?(\d+)$/, '$1'),
      );
    }
    const res = (await this.requestWithReturnedEntities(
      `cards`,
      {
        method: 'get',
        query: {
          descriptionFormat: 'markdown',
          ...options,
        } as FavroApi.Card.SearchQuery,
      },
      BravoCardInstance,
    )) as BravoResponseEntities<FavroApi.Card.Model, BravoCardInstance>;
    return res;
  }

  /**
   * Fetch instances of a card with a known `sequentialId`.
   * The `sequentialId` is the numeric part of the incrementing
   * ID shown in the card's UI and shareable URL.
   *
   * @param cardSequentialId - The card's number as shown in the UI
   *                         (can be just the number or include the prefix)
   */

  async findCardInstancesBySequentialId(
    cardSequentialId: number | string,
    options?: {
      /** Only return the instance on a given Widget */
      widgetCommonId?: string;
      /**
       * Only return the first instance even if there are
       * more than one (does nothing if `options.widgetCommonId` is set)
       */
      unique?: boolean;
    },
  ) {
    this.assert(cardSequentialId, `Card sequentialId is required`);
    const instances = await this.listCardInstances({
      cardSequentialId,
      widgetCommonId: options?.widgetCommonId,
      unique: options?.unique,
    });
    return await instances.getAllEntities();
  }

  /**
   * Directly fetch a card with a known `cardId` from the API.
   * Useful when the ID is already known to reduce API calls,
   * or to ensure that the local copy of a specific card's
   * content is up-to-date prior to taking some action.
   *
   * @param cardId - The Widget-specific `cardId` (not the `commonCardId`!)
   *
   * ???? https://favro.com/developer/#get-a-card
   */
  async findCardInstanceByCardId(cardId: string) {
    this.assert(cardId, `No cardId provided`);
    const res = (await this.requestWithReturnedEntities(
      `cards/${cardId}`,
      {
        method: 'get',
        query: {
          descriptionFormat: 'markdown',
        } as FavroApi.Card.SearchQuery,
      },
      BravoCardInstance,
    )) as BravoResponseEntities<FavroApi.Card.Model, BravoCardInstance>;
    return await res.getFirstEntity();
  }

  /**
   * Update a card, given its ID and a collection of changes
   * you want to make.
   *
   * @param cardId - The Widget-specific `cardId` (not the `commonCardId`!)
   *
   * @remarks Custom Fields are hard to update this way, since
   * they require knowing the correct identifiers for both
   * fields and values.
   *
   * ???? https://favro.com/developer/#update-a-card
   */
  async updateCardInstanceByCardId(
    cardId: string,
    options: FavroApi.Card.UpdateBody,
  ) {
    const res = (await this.requestWithReturnedEntities(
      `cards/${cardId}`,
      {
        method: 'put',
        query: {
          descriptionFormat: 'markdown',
        },
        body: options,
      },
      BravoCardInstance,
    )) as BravoResponseEntities<FavroApi.Card.Model, BravoCardInstance>;
    return await res.getFirstEntity();
  }

  /**
   * Upload an attachment to a card.
   * @param data - If not provided, assumes `filename` exists and
   *              attempts to use its content.
   */
  async addAttachmentToCardInstance(
    cardId: string,
    filename: string,
    data?: string | Buffer,
  ) {
    const body = data || readFileSync(filename);
    const res = (await this.request(`cards/${cardId}/attachment`, {
      method: 'post',
      body,
      query: { filename: basename(filename) },
    })) as FavroResponse<FavroApi.Attachment.Model, this>;
    const attachment = (await res.getParsedBody()) as FavroApi.Attachment.Model;
    this.assert(attachment?.fileURL, `Failed to add attachment`);
    return attachment;
  }

  /**
   * Delete a card by its *cardId* (not its *cardCommonId*!).
   * The cardId is associated with a single Widget. Optionally
   * delete the card *everywhere* instead of only the widget
   * in which it it has the given `cardId`
   *
   * ???? https://favro.com/developer/#delete-a-card
   */
  async deleteCardInstance(cardId: string, everywhere = false) {
    let url = `cards/${cardId}`;
    if (everywhere) {
      url += `?everywhere=true`;
    }
    await this.deleteEntity(url);
  }

  //#endregion

  //#region TAGS

  /**
   * Get and cache *all* tags. Lazy-loads and caches to reduce API calls.
   *
   * ???? https://favro.com/developer/#get-all-tags
   */
  async listTagDefinitions() {
    if (!this.cache.tags) {
      const res = (await this.requestWithReturnedEntities(
        `tags`,
        { method: 'get' },
        BravoTagDefinition,
      )) as BravoResponseEntities<FavroApi.Tag.Model, BravoTagDefinition>;
      this.cache.tags = res;
    }
    return this.cache.tags!;
  }

  async createTagDefinition(
    options: Partial<Omit<FavroApi.Tag.Model, 'tagId' | 'organizationId'>>,
  ) {
    const res = (await this.requestWithReturnedEntities(
      `tags`,
      {
        method: 'post',
        body: options,
      },
      BravoTagDefinition,
    )) as BravoResponseEntities<FavroApi.Tag.Model, BravoTagDefinition>;
    return await res.getFirstEntity();
  }

  async updateTagDefinition(
    options: RequiredBy<
      Partial<Omit<FavroApi.Tag.Model, 'organizationId'>>,
      'tagId'
    >,
  ) {
    const res = (await this.requestWithReturnedEntities(
      `tags`,
      {
        method: 'put',
        body: options,
      },
      BravoTagDefinition,
    )) as BravoResponseEntities<FavroApi.Tag.Model, BravoTagDefinition>;
    return await res.getFirstEntity();
  }

  async findTagDefinitionById(tagId: string) {
    const tags = await this.listTagDefinitions();
    const tag = await tags.findById('tagId', tagId);
    this.assert(tag, `No tag found with id ${tagId}`);
    return tag;
  }

  async findTagDefinitionByName(name: string | RegExp) {
    const tags = await this.listTagDefinitions();
    return await tags.find(createIsMatchFilter(name, 'name'));
  }

  async deleteTagById(tagId: string) {
    await this.deleteEntity(`tags/${tagId}`);
    // The caching method makes it hard to invalidate a single
    // tag entry (since it's all lazy-loaded), so for now do it
    // the DUMB WAY: clear the entire tags cache.
    this.cache.tags = undefined;
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
   * ????  https://favro.com/developer/#get-all-custom-fields
   */
  async listCustomFieldDefinitions() {
    if (!this.cache.customFields) {
      const res = (await this.requestWithReturnedEntities(
        `customfields`,
        { method: 'get' },
        BravoCustomFieldDefinition,
      )) as BravoResponseEntities<
        FavroApi.CustomFieldDefinition.Model,
        BravoCustomFieldDefinition<any>
      >;
      this.cache.customFields = res;
    }
    return this.cache.customFields!;
  }

  /**
   * Find a specific Custom Field definition by its unique ID.
   */
  async findCustomFieldDefinitionById(customFieldId: string) {
    const defs = await this.listCustomFieldDefinitions();
    const matching = await defs.find(
      (def) => def.customFieldId === customFieldId,
    );
    this.assert(
      matching,
      `No custom field definition found for id ${customFieldId}`,
    );
    return matching;
  }

  //#endregion

  //#region WEBHOOKS

  /**
   * List all webhooks.
   *
   * https://favro.com/developer/#get-all-webhooks
   */
  async listWebhooks(widgetCommonId?: string) {
    const res = await this.request<FavroApi.WebhookDefinition.Model[]>(
      'webhooks',
      { query: { widgetCommonId } },
    );
    const webhooks = (await res.getParsedBody()) || [];
    return webhooks.map((webhook) => new BravoWebhookDefinition(this, webhook));
  }

  async findWebhookByName(name: string | RegExp, widgetCommonId?: string) {
    const webhooks = await this.listWebhooks(widgetCommonId);
    return await webhooks.find(createIsMatchFilter(name, 'name'));
  }

  /**
   * Create a new webhook. If a secret is not provided, one will
   * be generated for you. (Webhook secrets are available when
   * fetching webhook definitions from the Favro API, so they
   * do not need to managed separately.)
   */
  async createWebhook(
    options: PartialBy<
      Omit<FavroApi.WebhookDefinition.Model, 'webhookId'>,
      'secret'
    >,
  ) {
    if (!options.secret) {
      options.secret = await generateRandomString(24, 'base64');
    }
    const res = (await this.requestWithReturnedEntities(
      `webhooks`,
      {
        method: 'post',
        body: options,
      },
      BravoWebhookDefinition,
    )) as BravoResponseEntities<
      FavroApi.WebhookDefinition.Model,
      BravoWebhookDefinition
    >;
    return await res.getFirstEntity();
  }

  async deleteWebhookById(webhookId: string) {
    await this.deleteEntity(`webhooks/${webhookId}`);
  }

  //#endregion

  //#region GROUPS

  /**
   * [???? See the docs.](https://favro.com/developer/#get-all-groups)
   */
  async listGroups() {
    const res = (await this.requestWithReturnedEntities(
      `groups`,
      { method: 'get' },
      BravoGroup,
    )) as BravoResponseEntities<FavroApi.Group.Model, BravoGroup>;
    return await res.getAllEntities();
  }

  /**
   * [???? See the docs.](https://favro.com/developer/#get-a-group)
   */
  async findGroupById(groupId: string) {
    const res = (await this.requestWithReturnedEntities(
      `groups/${groupId}`,
      { method: 'get' },
      BravoGroup,
    )) as BravoResponseEntities<FavroApi.Group.Model, BravoGroup>;
    return await res.getFirstEntity();
  }

  /**
   * [???? See the docs.](https://favro.com/developer/#create-a-group)
   */
  async createGroup(options: Pick<FavroApi.Group.Model, 'name' | 'members'>) {
    const res = (await this.requestWithReturnedEntities(
      `groups`,
      {
        method: 'post',
        body: options,
      },
      BravoGroup,
    )) as BravoResponseEntities<FavroApi.Group.Model, BravoGroup>;
    return await res.getFirstEntity();
  }

  /**
   * [???? See the docs.](https://favro.com/developer/#update-a-group)
   */
  async updateGroupById(groupId: string, options: FavroApi.Group.UpdateBody) {
    const res = (await this.requestWithReturnedEntities(
      `groups/${groupId}`,
      {
        method: 'put',
        body: options,
      },
      BravoGroup,
    )) as BravoResponseEntities<FavroApi.Group.Model, BravoGroup>;
    return await res.getFirstEntity();
  }

  /**
   * [???? See the docs.](https://favro.com/developer/#delete-a-group)
   */
  async deleteGroupById(groupId: string) {
    await this.deleteEntity(`groups/${groupId}`);
  }

  async deleteGroupByName(name: string) {
    const group = (await this.listGroups()).find((g) => g.name === name);
    if (group) {
      await this.deleteGroupById(group.groupId);
    }
  }

  //#endregion

  private async deleteEntity(url: string) {
    const res = await this.request(url, {
      method: 'delete',
    });
    this.assert(
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
