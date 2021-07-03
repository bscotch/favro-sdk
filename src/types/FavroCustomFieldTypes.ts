/**
 * @note
 * The documentation for the custom fields is a bit
 * unclear. The types below match the docs, but should be
 * checked for validity against real returned data. In
 * particular, some types refer to a "custom" object for
 * that same type -- it's unclear under what circumstances
 * the parent vs child objects are returned by the Favro API.
 *
 * {@link https://favro.com/developer/#custom-field-types}
 */

import type { BravoCustomFieldTypeName } from '$/lib/entities/BravoCustomField.js';

/**
 * The definition data for a custom field.
 *
 * {@link https://favro.com/developer/#custom-field}
 */
export interface DataFavroCustomField {
  /** The id of the organization that this custom field exists in. */
  organizationId: string;
  /** The id of the custom field. */
  customFieldId: string;
  /** Custom field type. */
  type: BravoCustomFieldTypeName;
  /** The name of the custom field. */
  name: string;
  /** True if the custom field is currently enabled for the organization. */
  enabled: boolean;
  /** The list of items that this custom field can have in case it is a selectable one. */
  customFieldItems?: {
    /** The id of the custom field item. */
    customFieldItemId: string;
    /** The name of the custom field item. */
    name: string;
  }[];
}
