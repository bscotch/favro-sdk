import { BravoEntity } from '$lib/BravoEntity.js';
import type { FavroApi } from '$favro';

/**
 * A Favro Column is one of the available values for the default
 * "Status" field on a board (the same one used for KanBan view).
 */
export class BravoColumn extends BravoEntity<FavroApi.Column.Model> {
  /** The unique identifier for this column on its parent Widget.*/
  get columnId() {
    return this._data.columnId;
  }
  /** The name of the column, a.k.a. its "Status". */
  get name() {
    return this._data.name;
  }
  /** The ID of the widget this Column belongs to. */
  get widgetCommonId() {
    return this._data.widgetCommonId;
  }
  get position() {
    return this._data.position;
  }
  /** The number of cards in this Column (i.e. with this status).*/
  get cardCount() {
    return this._data.cardCount;
  }
  get timeSum() {
    return this._data.timeSum;
  }
  get estimationSum() {
    return this._data.estimationSum;
  }
  get organizationId() {
    return this._data.organizationId;
  }
  equals(column: BravoColumn) {
    return this.hasSameConstructor(column) && this.columnId === column.columnId;
  }

  async delete() {
    if (!this.deleted) {
      await this._client.deleteColumnById(this.widgetCommonId, this.columnId);
    }
    this._deleted = true;
  }
}
