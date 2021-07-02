import { BravoEntity } from '../BravoEntity.js';
import type { BravoWidget } from './BravoWidget.js';
import type { DataFavroCollection } from '$/types/FavroApiTypes';
import type { OptionsBravoCreateWidget } from '$/types/ParameterOptions.js';

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

  async createWidget(name: string, options?: OptionsBravoCreateWidget) {
    return await this._client.createWidget(this.collectionId, name, options);
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
      ignoreCase?: boolean;
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
    if (this.deleted) {
      return;
    }
    await this._client.deleteCollectionById(this.collectionId);
    this._deleted = true;
  }

  equals(collection: BravoCollection) {
    return (
      this.hasSameConstructor(collection) &&
      this.collectionId === collection.collectionId
    );
  }
}
