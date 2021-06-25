import { FavroDataCollection } from '../types/FavroApi';

export class FavroCollection {
  private _data: FavroDataCollection;
  constructor(data: FavroDataCollection) {
    this._data = data;
  }
}
