import { DataFavroWidget } from '$/types/FavroWidgetTypes.js';
import { BravoEntity } from './BravoEntity';

export class BravoWidget extends BravoEntity<DataFavroWidget> {
  get widgetCommonId() {
    return this._data.widgetCommonId;
  }
  get collectionIds() {
    return this._data.collectionIds;
  }
  get name() {
    return this._data.name;
  }
  get breakdownCardCommonId() {
    return this._data.breakdownCardCommonId;
  }
  get ownerRole() {
    return this._data.ownerRole;
  }
  get editRole() {
    return this._data.editRole;
  }
}
