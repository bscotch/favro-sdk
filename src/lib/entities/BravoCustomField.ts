import type {
  DataFavroCustomFieldsValues,
  DataFavroCustomFieldType,
  DataFavroRating,
} from '$/types/FavroCardTypes.js';
import type { DataFavroCustomFieldDefinition } from '$/types/FavroCustomFieldTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { assertBravoClaim, BravoError } from '../errors.js';

type DataFavroCustomFieldTypeWithChoices =
  | 'Multiple select'
  | 'Single select'
  | 'Tags';

type CustomFieldOption =
  DataFavroCustomFieldDefinition<DataFavroCustomFieldTypeWithChoices>['customFieldItems'];

type BravoHumanFriendlyFieldValues = {
  Number: number;
  Time: number;
  Text: string;
  Rating: DataFavroRating;
  Voting: {
    tally: number;
    voters: string[];
  };
  Checkbox: boolean;
  Date: Date;
  Timeline: {
    startDate: Date;
    dueDate: Date;
    showTime: boolean;
  };
  Link: { url: string; text: string };
  Members: string[];
  Tags: CustomFieldOption[];
  'Single select': CustomFieldOption;
  'Multiple select': CustomFieldOption[];
};

export class BravoCustomFieldDefinition<
  TypeName extends DataFavroCustomFieldType,
> extends BravoEntity<DataFavroCustomFieldDefinition<TypeName>> {
  /**
   * Store a value from this Field Definition to allow operations
   * referencing the definition.
   */
  private _value?: DataFavroCustomFieldsValues[TypeName];

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

  static isChoiceField(
    fieldType: DataFavroCustomFieldType,
  ): fieldType is DataFavroCustomFieldTypeWithChoices {
    return ['Multiple select', 'Tags', 'Single select'].includes(fieldType);
  }

  static get typeNames() {
    return [
      'Number',
      'Time',
      'Text',
      'Rating',
      'Voting',
      'Checkbox',
      'Date',
      'Timeline',
      'Link',
      'Members',
      'Tags',
      'Single select',
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
  constructor(
    public readonly definition: BravoCustomFieldDefinition<TypeName>,
    public readonly value?: DataFavroCustomFieldsValues[TypeName],
  ) {}

  /** The type of this Custom Field */
  get type() {
    return this.definition.type;
  }

  /** The `customFieldId` of the field definition. */
  get customFieldId() {
    return this.definition.customFieldId;
  }

  /** The name of the Custom Field. */
  get name() {
    return this.definition.name;
  }

  /** For field types that have finite options, those options. */
  get customFieldItems() {
    return this.definition.customFieldItems;
  }

  /**
   * Whether or not there was a defined value provided
   * upon instantiation.*/
  get isSet() {
    return Array.isArray(this.value)
      ? this.value.length > 0
      : this.value !== undefined;
  }

  /**
   * If this type of field has options, and is also set,
   * the current value. Returns undefined if unset, and
   * throws if the field type does not include options.
   */
  get chosenOptions(): TypeName extends DataFavroCustomFieldTypeWithChoices
    ? { customFieldItemId: string; name: string }[]
    : never {
    const { type: fieldType, isSet } = this;
    assertBravoClaim(
      BravoCustomFieldDefinition.isChoiceField(fieldType),
      `Fields of type ${fieldType} do not have named choices.`,
    );
    if (!isSet) {
      // @ts-expect-error
      return [];
    }
    // @ts-expect-error
    return (this.value as { customFieldId: string; value: string[] }).value.map(
      (chosenId) =>
        this.customFieldItems!.find(
          (option) => option.customFieldItemId == chosenId,
        )!,
    );
  }

  get assignedTo(): TypeName extends 'Members' ? string[] : never {
    const { type: fieldType } = this;
    assertBravoClaim(
      fieldType === 'Members',
      `Fields of type ${fieldType} do not have members assigned to them.`,
    );
    // @ts-expect-error
    return this.value?.value || [];
  }

  get humanFriendlyValue():
    | BravoHumanFriendlyFieldValues[TypeName]
    | undefined {
    const type = this.type;
    const value = this.value;
    if (value === undefined) {
      return;
    }
    // Depending on TYPE, show a useful value
    // (Note: Typescript currently doesn't know how to handle using the type of one
    // thing to infer the type of another, in a generic, inside of a class.)
    switch (type) {
      case 'Number':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Number']).total;
      case 'Time':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Time']).total;
      case 'Text':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Text']).value;
      case 'Rating':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Rating']).total;
      case 'Voting':
        // @ts-expect-error ts(2322)
        return {
          tally: (value as DataFavroCustomFieldsValues['Voting']).value.length,
          voters: [...(value as DataFavroCustomFieldsValues['Voting']).value],
        };
      case 'Checkbox':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Checkbox']).value;
      case 'Date':
        // @ts-expect-error
        return new Date((value as DataFavroCustomFieldsValues['Date']).value);
      case 'Timeline':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Timeline']).timeline;
      case 'Link':
        // @ts-expect-error
        return (value as DataFavroCustomFieldsValues['Link']).link;
      case 'Members':
        // @ts-expect-error
        return this.assignedTo;
      case 'Tags':
        // @ts-expect-error
        return this.chosenOptions;
      case 'Single select':
        // @ts-expect-error
        return this.chosenOptions[0];
      case 'Multiple select':
        // @ts-expect-error
        return this.chosenOptions;
      default:
        throw new BravoError(`Unknown custom field type: ${type}`);
    }
  }
}
