import { DataFavroWidget } from '$types/FavroWidgetTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { selectRandom } from '$lib/utility.js';

export type OptionWidgetColor = typeof BravoWidget['colors'][number];

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

  /** Allowed colors for Widgets */
  static get colors() {
    return [
      'blue',
      'lightgreen',
      'brown',
      'purple',
      'orange',
      'yellow',
      'gray',
      'red',
      'cyan',
      'green',
    ] as const;
  }
  /** Choose a random color useable by Widgets */
  static getRandomColor() {
    return selectRandom(BravoWidget.colors);
  }
}
