import type { BravoOrganization } from '$entities/BravoOrganization.js';
import type { BravoUser } from '$/lib/entities/BravoUser';
import type { BravoCollection } from '$entities/BravoCollection.js';
import type {
  BravoResponseCustomFields,
  BravoResponseTags,
  BravoResponseWidgets,
} from './BravoResponse.js';
import type { BravoColumn } from '../entities/BravoColumn.js';
import type { BravoClient } from '$/index.js';

export class BravoClientCache {
  constructor(private client: BravoClient) {}
  protected _organizations?: BravoOrganization[];
  protected _users?: BravoUser[];
  protected _collections?: BravoCollection[];

  /**
   * Widget paging results keyed by collectionId, with the empty string `''`
   * used to key the paging result from not using a collectionId (global).
   */
  protected _widgets: Map<string, BravoResponseWidgets> = new Map();

  /**
   * Widget columns are fetched separately via the API. They can
   * be fetched directly, but more likely will all be fetched at once
   * for a given Widget. Caching on a per-widget basis probably
   * makes the most sense.
   */
  protected _columns: Map<string, BravoColumn[]> = new Map();

  /**
   * Custom Field definitions are needed to get actual values and
   * field names (plus possible values) from cards. Favro has no
   * filtering options for Custom Fields
   */
  protected _customFields?: BravoResponseCustomFields;

  /**
   * Tags are handled like Custom Fields, since they are global
   * and not meaningfully searchable via the API.
   */
  protected _tags?: BravoResponseTags;

  get collections() {
    // @ts-expect-error
    return this._collections ? [...this._collections] : undefined;
  }
  set collections(collections: BravoCollection[]) {
    this._collections = collections;
  }

  get users() {
    // @ts-expect-error
    return this._users ? [...this._users] : undefined;
  }
  set users(users: BravoUser[]) {
    this._users = users;
  }

  get organizations() {
    // @ts-expect-error
    return this._organizations ? [...this._organizations] : undefined;
  }
  set organizations(orgs: BravoOrganization[]) {
    this._organizations = orgs;
  }

  get customFields() {
    // @ts-expect-error
    return this._customFields;
  }
  set customFields(customFields: BravoResponseCustomFields) {
    this._customFields = customFields;
  }

  get tags() {
    return this._tags;
  }
  set tags(tags: BravoResponseTags | undefined) {
    this._tags = tags;
  }

  /**
   * Get the widget paging object from a get-all-widgets
   * search, keyed by collectionId. If the collectionId
   * is not provided, or set to `''`, the global all-widgets
   * pager is returned (if in the cache).
   */
  getWidgets(collectionId = '') {
    return this._widgets.get(collectionId);
  }

  /**
   * Replace the stored widget pager (or add if there isn't one) for
   * a given collection. If the collectionId is unset, or `''`, it's
   * assumed the widget pager is from a
   */
  setWidgets(widgetPager: BravoResponseWidgets, collectionId = '') {
    this.client.assert(widgetPager, 'Must provide a widget pager!');
    this._widgets.set(collectionId, widgetPager);
  }

  getColumns(collectionId: string) {
    const columns = this._columns.get(collectionId);
    return columns && [...columns];
  }

  /** Set the cache for the columns of a widget */
  setColumns(widgetCommonId: string, columns: BravoColumn[]) {
    this.client.assert(widgetCommonId, 'Must provide a widget id!');
    this._columns.set(widgetCommonId, [...columns]);
  }

  /**
   * Replace/add a cached column for a widget.
   * Useful for updating the cache after adding or
   * updating a column.
   * Does nothing if there isn't already a cached
   * list of columns for this widget.
   *
   * **Use with caution:** you can create bad caches with this!
   */
  addColumn(widgetCommonId: string, column: BravoColumn) {
    this.removeColumn(widgetCommonId, column.columnId);
    // Only add if the cache already exists
    this._columns.get(widgetCommonId)?.push(column);
  }

  /**
   * Remove a cached column for a widget.
   * Useful for updating the cache after deleting a column.
   * Does nothing if there isn't already a cached
   * list of columns for this widget.
   *
   * **Use with caution:** you can create bad caches with this!
   */
  removeColumn(widgetCommonId: string, columnId: string) {
    const columns = this._columns.get(widgetCommonId);
    if (!columns) {
      return;
    }
    const idx = columns.findIndex((col) => col.columnId == columnId);
    if (idx > -1) {
      columns.splice(idx, 1);
    }
  }

  /**
   * Add a collection to the cache *if the cache already exists*,
   * e.g. for updating it after creating a new collection. Ensures
   * uniqueness. If the collection is already in the cache, it
   * will be replaced by the one provided in this call (e.g. for
   * replacing the cached copy with an updated one).
   */
  addCollection(collection: BravoCollection) {
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
  removeCollection(collectionId: string) {
    const cachedIdx = this._collections?.findIndex(
      (c) => c.collectionId == collectionId,
    );
    if (typeof cachedIdx == 'number' && cachedIdx > -1) {
      this._collections!.splice(cachedIdx, 1);
    }
  }

  /** Clear the entire cache */
  /**
   * To reduce API calls (the rate limits are tight), things
   * are generally cached. To ensure requests are up to date
   * with recent changes, you can force a cache clear.
   */
  clear() {
    this._users = undefined;
    this._organizations = undefined;
    this._collections = undefined;
    this._widgets.clear();
    this._columns.clear();
    this._customFields = undefined;
    this._tags = undefined;
  }
}
