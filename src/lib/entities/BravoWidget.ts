import { DataFavroWidget } from '$types/FavroWidgetTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { selectRandom } from '$lib/utility.js';
import { BravoColumn } from './BravoColumn.js';
import { ArrayMatchFunction } from '$/types/Utility.js';

export type OptionWidgetColor = typeof BravoWidget['colors'][number];

export class BravoWidget extends BravoEntity<DataFavroWidget> {
  /** TODO: Move to cache! */
  private _columns?: BravoColumn[];

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

  async listColumns() {
    if (!this._columns) {
      this._columns = await this._client.listColumns(this.widgetCommonId);
    }
    return [...this._columns];
  }

  async findColumn(matchFunction: ArrayMatchFunction<BravoColumn>) {
    return await this._client.findColumn(this.widgetCommonId, matchFunction);
  }

  async deleteColumnById(columnId: string) {
    return await this.findColumn((col) => col.columnId == columnId);
  }

  async delete() {
    if (!this.deleted) {
      await this._client.deleteWidgetById(this.widgetCommonId);
    }
    this._deleted = true;
  }

  equals(widget: BravoWidget) {
    return (
      this.hasSameConstructor(widget) &&
      this.widgetCommonId === widget.widgetCommonId
    );
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
