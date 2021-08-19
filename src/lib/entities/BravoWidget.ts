import { BravoEntity } from '$lib/BravoEntity.js';
import { selectRandom, stringsMatch } from '$lib/utility.js';
import type { DataFavroWidget } from '$types/FavroWidgetTypes.js';
import type { BravoColumn } from './BravoColumn.js';
import type { ArrayMatchFunction } from '$/types/Utility.js';
import type {
  FavroApiGetCardsBase,
  FavroApiParamsCardCreate,
} from '$/types/FavroCardTypes.js';
import type { BravoCardInstance } from './BravoCard.js';

export type OptionWidgetColor = typeof BravoWidget['colors'][number];

export class BravoWidget extends BravoEntity<DataFavroWidget> {
  get widgetCommonId() {
    return this._data.widgetCommonId;
  }
  get name() {
    return this._data.name;
  }
  /** The IDs for the Collections this Widget is found in.*/
  get collectionIds() {
    return this._data.collectionIds;
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

  //#region COLUMNS

  async createColumn(name: string, options?: { position?: number }) {
    return await this._client.createColumn(this.widgetCommonId, name, options);
  }

  /**
   * List all Columns (Status values) on this Widget.
   */
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

  async deleteColumnById(columnId: string) {
    return await this._client.deleteColumnById(this.widgetCommonId, columnId);
  }

  //#endregion

  //#region CARDS

  /**
   * Get all cards on this Widget, with optional
   * additional filter parameters. **Note:** makes
   * an API request on *every call* (no caching),
   * so prefer re-use of the results to re-fetching,
   * and limit by `columnId` if possible.
   */
  async listCards(options?: FavroApiGetCardsBase) {
    return await this._client.listCards({
      ...options,
      widgetCommonId: this.widgetCommonId,
    });
  }

  async findCard(
    matchFunc: ArrayMatchFunction<BravoCardInstance>,
    options?: FavroApiGetCardsBase,
  ) {
    const cards = await this.listCards(options);
    return await cards.find(matchFunc);
  }

  async findCardByName(
    name: string,
    options?: FavroApiGetCardsBase & { ignoreCase?: boolean },
  ) {
    return await this.findCard((card) => {
      return stringsMatch(card.name, name, options);
    }, options);
  }

  async createCard(data: Omit<FavroApiParamsCardCreate, 'widgetCommonId'>) {
    return await this._client.createCard({
      ...data,
      widgetCommonId: this.widgetCommonId,
    });
  }

  //#endregion

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
