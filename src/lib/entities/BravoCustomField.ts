import {
  DataFavroCustomFieldsValues,
  DataFavroCustomFieldType,
} from '$/types/FavroCardTypes.js';
import type { DataFavroCustomFieldDefinition } from '$/types/FavroCustomFieldTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';

export class BravoCustomFieldDefinition<
  TypeName extends DataFavroCustomFieldType,
> extends BravoEntity<DataFavroCustomFieldDefinition<TypeName>> {
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

  equals(fieldDefinition: BravoCustomFieldDefinition<any>) {
    return (
      this.hasSameConstructor(fieldDefinition) &&
      this.customFieldId === fieldDefinition.customFieldId
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

/**
 * A combination of a Custom Field Definition and (optional) Value,
 * with helper methods for getting and setting the value on a card
 * in a user-friendly way.
 */
export class BravoCustomField<TypeName extends DataFavroCustomFieldType> {
  public readonly customFieldId: string;
  public readonly type: TypeName;
  private _value?: DataFavroCustomFieldsValues[TypeName];

  constructor(
    public readonly definition: BravoCustomFieldDefinition<TypeName>,
    value?: DataFavroCustomFieldsValues[TypeName],
  ) {
    this.customFieldId = definition.customFieldId;
    this.type = definition.type;
    this._value = value;
  }
  get name() {
    return this.definition.name;
  }
  set value(value: DataFavroCustomFieldsValues[TypeName]) {
    this._value = value;
  }
  // @ts-expect-error
  get value(): DataFavroCustomFieldsValues[TypeName] | undefined {
    return this._value;
  }
  get hasValue() {
    return !!this._value;
  }
}
