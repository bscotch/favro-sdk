import type { FavroDataTypes } from '$/types/FavroTagTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';

/** Hydrated Favro Organization. */
export class BravoTagDefinition extends BravoEntity<FavroDataTypes.Tag.Definition> {
  get name() {
    return this._data.name;
  }

  get tagId() {
    return this._data.tagId;
  }

  get color() {
    return this._data.color;
  }

  get organizationId() {
    return this._data.organizationId;
  }

  async delete() {
    await this._client.deleteTagById(this.tagId);
  }

  equals(tag: BravoTagDefinition) {
    return this.hasSameConstructor(tag) && this.tagId === tag.tagId;
  }
}
