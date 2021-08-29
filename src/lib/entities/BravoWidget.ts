import { BravoEntity } from '$lib/BravoEntity.js';
import { stringsMatch } from '$lib/utility.js';
import type { FavroApi } from '$favro';
import type { BravoColumn } from './BravoColumn.js';
import type { ArrayMatchFunction } from '$/types/Utility.js';
import type { BravoCardInstance } from './BravoCard.js';

export type BravoCardSearchQueryBase = Exclude<
  FavroApi.Card.SearchQuery,
  'cardCommonId' | 'widgetCommonId' | 'collectionId' | 'cardSequentialId'
>;

export class BravoWidget extends BravoEntity<FavroApi.Widget.Model> {
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
   * additional filter parameters. There is only
   * one instance of a card per Widget.
   *
   * **Note:** makes
   * an API request on *every call* (no caching),
   * so prefer re-use of the results to re-fetching,
   * and limit by `columnId` if possible.
   */
  async listCardInstances(options?: BravoCardSearchQueryBase) {
    return await this._client.listCardInstances({
      ...options,
      widgetCommonId: this.widgetCommonId,
    });
  }

  async findCardInstance(
    matchFunc: ArrayMatchFunction<BravoCardInstance>,
    options?: BravoCardSearchQueryBase,
  ) {
    const cards = await this.listCardInstances(options);
    return await cards.find(matchFunc);
  }

  async findCardInstanceByName(
    name: string,
    options?: BravoCardSearchQueryBase & { ignoreCase?: boolean },
  ) {
    return await this.findCardInstance((card) => {
      return stringsMatch(card.name, name, options);
    }, options);
  }

  async findCardInstanceBySequentialId(sequentialId: string) {
    return (
      await this._client.listCardInstances({
        cardSequentialId: sequentialId,
        widgetCommonId: this.widgetCommonId,
      })
    ).getFirstEntity();
  }

  async createCard(data: Omit<FavroApi.Card.CreateBody, 'widgetCommonId'>) {
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
}
