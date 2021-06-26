import { FavroOrganization } from '@/FavroOrganization.js';
import { FavroUser } from '@/FavroUser.js';
import { FavroCollection } from '@/FavroCollection.js';

export class BravoClientCache {
  protected _organizations?: FavroOrganization[];
  protected _users?: FavroUser[];
  protected _collections?: FavroCollection[];

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
   */ clear() {
    this._users = undefined;
    this._organizations = undefined;
    this._collections = undefined;
  }
}
