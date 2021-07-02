import { BravoEntity } from '$lib/BravoEntity.js';
import { DataFavroColumn } from '$/types/FavroColumnTypes.js';

export class BravoColumn extends BravoEntity<DataFavroColumn> {
  get columnId() {
    return this._data.columnId;
  }
  get widgetCommonId() {
    return this._data.widgetCommonId;
  }
  get name() {
    return this._data.name;
  }
  get organizationId() {
    return this._data.organizationId;
  }
  get position() {
    return this._data.position;
  }
  get cardCount() {
    return this._data.cardCount;
  }
  get timeSum() {
    return this._data.timeSum;
  }
  get estimationSum() {
    return this._data.estimationSum;
  }
  equals(column: BravoColumn) {
    return this.hasSameConstructor(column) && this.columnId === column.columnId;
  }

  async delete() {
    if (!this.deleted) {
      await this._client.deleteColumn(this.widgetCommonId, this.columnId);
    }
    this._deleted = true;
  }
}
