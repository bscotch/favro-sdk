import { DataFavroCollection } from '../types/FavroApiTypes';
import { FavroEntity } from './FavroEntity.js';

export class FavroCollection extends FavroEntity<DataFavroCollection> {
  get name() {
    return this._data.name;
  }

  get collectionId() {
    return this._data.collectionId;
  }

  get organizationId() {
    return this._data.organizationId;
  }
}
