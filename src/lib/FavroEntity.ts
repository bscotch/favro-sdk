import { BravoClient } from './BravoClient.js';

/**
 * Base class for Favro Entities (wrapping raw API data)
 */
export class FavroEntity<EntityData> {
  constructor(protected _client: BravoClient, protected _data: EntityData) {}

  toJSON() {
    return { ...this._data };
  }
}
