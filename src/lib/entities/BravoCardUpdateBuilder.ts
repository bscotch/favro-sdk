import {
  DataFavroCardFavroAttachment,
  DataFavroCustomFieldType,
  DataFavroRating,
} from '$/types/FavroCardTypes.js';
import {
  FavroApiParamsCardCustomField,
  FavroApiParamsCardUpdate,
  FavroApiParamsCardUpdateArrayField,
} from '$/types/FavroCardUpdateTypes.js';
import { DataFavroCustomFieldDefinition } from '$/types/FavroCustomFieldTypes.js';
import { RequiredBy } from '$/types/Utility.js';
import { assertBravoClaim } from '../errors.js';
import {
  createIsMatchFilter,
  ensureArrayExistsAndAddUnique,
  ensureArrayExistsAndAddUniqueBy,
  removeFromArray,
  stringsOrObjectsToStrings,
  wrapIfNotArray,
} from '../utility.js';
import {
  BravoCustomField,
  BravoCustomFieldDefinition,
} from './BravoCustomField.js';
import { BravoUser } from './BravoUser.js';

export type CustomFieldOrId<FieldType extends DataFavroCustomFieldType = any> =
  | string
  | DataFavroCustomFieldDefinition
  | BravoCustomFieldDefinition<FieldType>
  | BravoCustomField<FieldType>;

/**
 * A Card update can be pretty complex, and to save API
 * calls its best to do all desired updates in one go
 * where possible. The Update Builder makes it (relatively)
 * easy to construct a complex update with a chaining-based
 * approach.
 */
export class BravoCardUpdateBuilder {
  private update: RequiredBy<FavroApiParamsCardUpdate, 'customFields'> = {
    customFields: [],
  };
  constructor() {}

  setName(name: string) {
    this.update.name = name;
    return this;
  }

  setDescription(description: string) {
    this.update.detailedDescription = description;
    return this;
  }

  assign(usersOrIds: (string | BravoUser)[]) {
    return this.addToUniqueArray(
      'addAssignmentIds',
      stringsOrObjectsToStrings(usersOrIds, 'userId'),
      'removeAssignmentIds',
    );
  }

  unassign(usersOrIds: (string | BravoUser)[]) {
    return this.addToUniqueArray(
      'removeAssignmentIds',
      stringsOrObjectsToStrings(usersOrIds, 'userId'),
      'addAssignmentIds',
    );
  }

  completeAssignment(usersOrIds: (string | BravoUser)[]) {
    return this.setAssignmentCompletion(
      stringsOrObjectsToStrings(usersOrIds, 'userId'),
      true,
    );
  }

  uncompleteAssignment(usersOrIds: (string | BravoUser)[]) {
    return this.setAssignmentCompletion(
      stringsOrObjectsToStrings(usersOrIds, 'userId'),
      false,
    );
  }

  addTagsByName(names: string[]) {
    return this.addToUniqueArray('addTags', names, 'removeTags');
  }

  removeTagsByName(names: string[]) {
    return this.addToUniqueArray('removeTags', names, 'addTags');
  }

  addTagsById(ids: string[]) {
    return this.addToUniqueArray('addTagIds', ids, 'removeTagIds');
  }

  removeTagsById(ids: string[]) {
    return this.addToUniqueArray('removeTagIds', ids, 'addTagIds');
  }

  setStartDate(date: Date | null) {
    this.update.startDate = date?.toISOString() || null;
    return this;
  }

  unsetStartDate() {
    return this.setStartDate(null);
  }

  setDueDate(date: Date | null) {
    this.update.dueDate = date?.toISOString() || null;
    return this;
  }

  unsetDueDate() {
    return this.setDueDate(null);
  }

  removeAttachments(fileUrls: string[]) {
    return this.addToUniqueArray('removeAttachments', fileUrls);
  }

  addFavroAttachments(favroItems: DataFavroCardFavroAttachment[]) {
    this.update.addFavroAttachments ||= [];
    ensureArrayExistsAndAddUniqueBy(
      this.update.addFavroAttachments,
      'itemCommonId',
      favroItems,
    );
    return this;
  }

  removeFavroAttachmentsById(itemCommonIds: string[]) {
    return this.addToUniqueArray('removeFavroAttachmentIds', itemCommonIds);
  }

  archive() {
    this.update.archive = true;
    return this;
  }

  unarchive() {
    this.update.archive = false;
    return this;
  }

  addToWidget(
    widgetCommonId: string,
    options?: Pick<
      FavroApiParamsCardUpdate,
      | 'columnId'
      | 'laneId'
      | 'dragMode'
      | 'position'
      | 'listPosition'
      | 'sheetPosition'
      | 'parentCardId'
    >,
  ) {
    Object.assign({
      widgetCommonId,
      ...options,
    });
    return this;
  }

  private setCustomFieldUniquely(
    customFieldOrId: CustomFieldOrId,
    update: FavroApiParamsCardCustomField,
  ) {
    const customFieldId =
      typeof customFieldOrId == 'string'
        ? customFieldOrId
        : customFieldOrId.customFieldId;
    const currentIdx = this.update.customFields.findIndex(
      (f) => f.customFieldId === customFieldId,
    );
    if (currentIdx > -1) {
      this.update.customFields.splice(currentIdx, 1, {
        customFieldId,
        ...update,
      });
    } else {
      this.update.customFields.push({ customFieldId, ...update });
    }
    return this;
  }

  setCustomStatusByStatusId(
    customFieldOrId: CustomFieldOrId<'Single select'>,
    statusId: string,
  ) {
    return this.setCustomFieldUniquely(customFieldOrId, { value: [statusId] });
  }

  setCustomStatusByStatusName(
    customFieldId: CustomFieldOrId<'Single select'>,
    statusName: string | RegExp,
    fieldDefinition:
      | DataFavroCustomFieldDefinition
      | BravoCustomFieldDefinition<'Single select'>
      | BravoCustomField<'Single select'>,
  ) {
    const status = fieldDefinition.customFieldItems!.find(
      createIsMatchFilter(statusName, 'name'),
    );
    assertBravoClaim(
      status,
      `No status matching ${statusName} found on custom field ${customFieldId}`,
    );
    return this.setCustomStatusByStatusId(
      customFieldId,
      status.customFieldItemId,
    );
  }

  setCustomText(customFieldId: CustomFieldOrId<'Text'>, text: string) {
    assertBravoClaim(
      typeof text == 'string' && text,
      `"${text}" is not a valid string`,
    );
    this.setCustomFieldUniquely(customFieldId, { value: text });
  }

  setCustomNumber(customFieldId: CustomFieldOrId<'Number'>, number: number) {
    assertBravoClaim(
      typeof number == 'number' && !isNaN(number),
      `${number} is not a valid number`,
    );
    return this.setCustomFieldUniquely(customFieldId, { total: number });
  }

  setCustomCheckbox(
    customFieldId: CustomFieldOrId<'Checkbox'>,
    checked: boolean,
  ) {
    return this.setCustomFieldUniquely(customFieldId, { value: checked });
  }

  setCustomLink(
    customFieldId: CustomFieldOrId<'Link'>,
    url: string,
    text?: string,
  ) {
    return this.setCustomFieldUniquely(customFieldId, {
      link: { url, text: text || url },
    });
  }

  setCustomDate(customfieldId: CustomFieldOrId<'Date'>, date: Date) {
    return this.setCustomFieldUniquely(customfieldId, {
      value: date.toISOString(),
    });
  }

  setCustomVote(customFieldId: CustomFieldOrId<'Voting'>, vote: boolean) {
    return this.setCustomFieldUniquely(customFieldId, { value: vote });
  }

  setCustomRating(
    customFieldId: CustomFieldOrId<'Rating'>,
    rating: DataFavroRating,
  ) {
    return this.setCustomFieldUniquely(customFieldId, { total: rating });
  }

  // TODO: Map these onto Card methods & test

  /**
   * Get a plain update object that can be directly used
   * by the Favro Card Update endpoint.
   */
  toJSON() {
    return {
      ...this.update,
    };
  }

  private setAssignmentCompletion(
    userIds: string | string[],
    completed: boolean,
  ) {
    const updateObjs = wrapIfNotArray(userIds).map((userId) => ({
      userId,
      completed,
    }));
    this.update.completeAssignments ||= [];
    ensureArrayExistsAndAddUniqueBy(
      this.update.completeAssignments,
      'userId',
      updateObjs,
    );
    return this;
  }

  /**
   * Utility method for adding a value to one array (uniquely)
   * while optionally ensuring that the same value does NOT
   * appear in another array, e.g. to prevent an "add" and "remove"
   * version of the same action from both containing the same value.
   */
  private addToUniqueArray<Field extends FavroApiParamsCardUpdateArrayField>(
    updateField: Field,
    values: FavroApiParamsCardUpdate[Field],
    opposingField?: FavroApiParamsCardUpdateArrayField,
  ) {
    this.update[updateField] ||= [];
    // @ts-expect-error
    ensureArrayExistsAndAddUnique(this.update[updateField], values);
    if (opposingField) {
      // @ts-expect-error
      removeFromArray(this.update[opposingField], values);
    }
    return this;
  }
}
