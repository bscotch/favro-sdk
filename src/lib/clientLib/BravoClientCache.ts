import { FavroOrganization } from '@/FavroOrganization.js';
import { FavroUser } from '@/FavroUser.js';
import { FavroCollection } from '@/FavroCollection.js';
import type { BravoResponseWidgets } from './BravoResponse.js';
import { assertBravoClaim } from '@/errors.js';

export class BravoClientCache {
  protected _organizations?: FavroOrganization[];
  protected _users?: FavroUser[];
  protected _collections?: FavroCollection[];
  /**
   * Widget paging results keyed by collectionId, with the empty string `''`
   * used to key the paging result from not using a collectionId (global).
   */
  protected _widgets: Map<string, BravoResponseWidgets> = new Map();

  get collections() {
    // @ts-expect-error
    return this._collections ? [...this._collections] : undefined;
  }
  set collections(collections: FavroCollection[]) {
    this._collections = collections;
  }

  get users() {
    // @ts-expect-error
    return this._users ? [...this._users] : undefined;
  }
  set users(users: FavroUser[]) {
    this._users = users;
  }

  get organizations() {
    // @ts-expect-error
    return this._organizations ? [...this._organizations] : undefined;
  }
  set organizations(orgs: FavroOrganization[]) {
    this._organizations = orgs;
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
  addWidgets(widgetPager: BravoResponseWidgets, collectionId = '') {
    assertBravoClaim(widgetPager, 'Must provide a widget pager!');
    this._widgets.set(collectionId, widgetPager);
  }

  /**
   * Add a collection to the cache *if the cache already exists*,
   * e.g. for updating it after creating a new collection. Ensures
   * uniqueness. If the collection is already in the cache, it
   * will be replaced by the one provided in this call (e.g. for
   * replacing the cached copy with an updated one).
   */
  addCollection(collection: FavroCollection) {
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
  }
}
