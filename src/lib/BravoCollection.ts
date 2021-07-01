import { DataFavroCollection } from '../types/FavroApiTypes';
import { BravoEntity } from './BravoEntity.js';
import { BravoWidget } from './BravoWidget.js';

export class BravoCollection extends BravoEntity<DataFavroCollection> {
  get name() {
    return this._data.name;
  }

  get collectionId() {
    return this._data.collectionId;
  }

  get organizationId() {
    return this._data.organizationId;
  }

  /**
   * Get list of all widgets in this collection
   */
  async listWidgets() {
    return await this._client.listWidgets(this.collectionId);
  }

  /**
   * Find the first widget in this collection for which the
   * `matchFunction` returns a truthy value. Can be async
   */
  async findWidget(
    matchFunction: (widget: BravoWidget, idx?: number) => any | Promise<any>,
  ) {
    return this._client.findWidget(matchFunction, this.collectionId);
  }

  /**
   * Find the first widget in this collection that matches
   * the provided name. Ignores case by default.
   */
  async findWidgetByName(
    name: string,
    options?: {
      matchCase?: boolean;
    },
  ) {
    return await this._client.findWidgetByName(
      name,
      this.collectionId,
      options,
    );
  }

  /** Delete this collection from Favro. **Use with care!** */
  async delete() {
    await this._client.deleteCollectionById(this.collectionId);
  }
}
