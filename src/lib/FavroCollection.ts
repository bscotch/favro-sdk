import { FavroDataCollection } from '../types/FavroApi';
import { FavroEntity } from './FavroEntity.js';

export class FavroCollection extends FavroEntity<FavroDataCollection> {
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
