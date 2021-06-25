import { FavroDataCollection } from '../types/FavroApi';

export class FavroCollection {
  private _data: FavroDataCollection;
  constructor(data: FavroDataCollection) {
    this._data = data;
  }

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
