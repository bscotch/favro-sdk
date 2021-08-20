import type { DataFavroCustomField } from '$/types/FavroCustomFieldTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';

export type BravoCustomFieldTypeName =
  typeof BravoCustomFieldDefinition['typeNames'][number];

export class BravoCustomFieldDefinition extends BravoEntity<DataFavroCustomField> {
  get name() {
    return this._data.name;
  }

  get customFieldId() {
    return this._data.customFieldId;
  }

  get type() {
    return this._data.type;
  }

  /**
   * For choice-based custom fields (e.g. tags, multi-select),
   * the set of possible values and their associated IDs.
   * Needed when looking up id-based field values on card data.
   */
  get customFieldItems() {
    return this._data.customFieldItems;
  }

  get organizationId() {
    return this._data.organizationId;
  }

  get enabled() {
    return this._data.enabled;
  }

  equals(org: BravoCustomFieldDefinition) {
    return (
      this.hasSameConstructor(org) && this.customFieldId === org.customFieldId
    );
  }

  static get typeNames() {
    return [
      'Number',
      'Time',
      'Text',
      'Rating',
      'Vote',
      'Checkbox',
      'Date',
      'Timeline',
      'Link',
      'Members',
      'Tags',
      'Status',
      'Multiple select',
    ] as const;
  }
}
