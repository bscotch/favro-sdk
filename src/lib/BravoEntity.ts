import type { BravoClient } from './BravoClient.js';

/**
 * Base class for Favro Entities (wrapping raw API data)
 */
export abstract class BravoEntity<EntityData extends Record<string, any>> {
  protected _deleted = false;

  constructor(protected _client: BravoClient, protected _data: EntityData) {}

  /**
   * If this *specific instance* was used to delete itself.
   * This could be `false` despite the source Favro data having
   * been deleted in some other way.
   */
  get deleted() {
    return this._deleted;
  }

  /**
   * Check if another entity represents the same underlying data
   * (do not have to be the same instance)
   */
  abstract equals(otherEntity: any): boolean;

  hasSameConstructor(otherEntity: any) {
    return this.constructor === otherEntity.constructor;
  }

  toJSON() {
    return { ...this._data };
  }
}
