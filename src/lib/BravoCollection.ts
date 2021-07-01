import { DataFavroCollection } from '../types/FavroApiTypes';
import { BravoEntity } from './BravoEntity.js';

export class BravoCollection extends BravoEntity<DataFavroCollection> {
  get name() {
    return this._data.name;
  }

  get collectionId() {
    return this._data.collectionId;
  }

  get organizationId() {
    return this._data.organizationId;
  }

  /** Delete this collection from Favro. **Use with care!** */
  async delete() {
    await this._client.deleteCollectionById(this.collectionId);
  }
}
