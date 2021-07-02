import { DataFavroWidget } from '$types/FavroWidgetTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { selectRandom, stringsMatch } from '$lib/utility.js';
import type { BravoColumn } from './BravoColumn.js';
import type { ArrayMatchFunction } from '$/types/Utility.js';

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

  async createColumn(name: string, options?: { position?: number }) {
    return await this._client.createColumn(this.widgetCommonId, name, options);
  }

  async listColumns() {
    return await this._client.listColumns(this.widgetCommonId);
  }

  async findColumn(matchFunction: ArrayMatchFunction<BravoColumn>) {
    return await this._client.findColumn(this.widgetCommonId, matchFunction);
  }

  async findColumnByName(name: string, options?: { ignoreCase?: boolean }) {
    const column = await this.findColumn((col) => {
      return stringsMatch(col.name, name, options);
    });
    return column;
  }

  async deleteColumn(columnId: string) {
    return await this._client.deleteColumn(this.widgetCommonId, columnId);
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
