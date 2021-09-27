import type { FavroApi } from '$/index.js';
import type { ExtractKeysByValue, RequiredBy } from '$/types/Utility.js';
import { BravoError } from '../errors.js';
import {
  addToUniqueArrayBy,
  createIsMatchFilter,
  ensureArrayExistsAndAddUnique,
  ensureArrayExistsAndAddUniqueBy,
  isMatch,
  removeFromArray,
  stringsOrObjectsToStrings,
  wrapIfNotArray,
} from '../utility.js';
import type {
  BravoCustomField,
  BravoCustomFieldDefinition,
} from './BravoCustomField.js';
import type { BravoTagDefinition } from './BravoTag.js';
import type { BravoUser } from './BravoUser.js';

export type CustomFieldOrId<FieldType extends FavroApi.CustomFieldType = any> =
  | string
  | FavroApi.CustomFieldDefinition.Model<FieldType>
  | BravoCustomFieldDefinition<FieldType>
  | BravoCustomField<FieldType>;

export type BravoCardFieldWithArrayValue = ExtractKeysByValue<
  Required<FavroApi.Card.UpdateBody>,
  any[]
>;
/**
 * A Card update can be pretty complex, and to save API
 * calls its best to do all desired updates in one go
 * where possible. The Update Builder makes it (relatively)
 * easy to construct a complex update with a chaining-based
 * approach.
 */
export class BravoCardUpdateBuilder {
  private update: RequiredBy<FavroApi.Card.UpdateBody, 'customFields'> = {
    customFields: [],
  };

  private error = BravoError;

  constructor(options?: { error: typeof BravoError }) {
    this.error = options?.error || BravoError;
  }

  assert(claim: any, message: string): asserts claim {
    if (!claim) {
      throw new this.error(message);
    }
  }

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

  addTags(tagDefinitionsOrIds: (string | BravoTagDefinition)[]) {
    const tagIds = stringsOrObjectsToStrings(tagDefinitionsOrIds, 'tagId');
    return this.addToUniqueArray('addTagIds', tagIds, 'removeTagIds');
  }

  removeTags(tagDefinitionsOrIds: (string | BravoTagDefinition)[]) {
    const tagIds = stringsOrObjectsToStrings(tagDefinitionsOrIds, 'tagId');
    return this.addToUniqueArray('removeTagIds', tagIds, 'addTagIds');
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

  addFavroAttachments(
    favroItems: FavroApi.Card.ModelFieldValue.FavroAttachment[],
  ) {
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
      FavroApi.Card.UpdateBody,
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
    update: FavroApi.CustomFieldValue.UpdateBody,
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

  setCustomSingleSelect(
    customFieldOrId: CustomFieldOrId<'Single select'>,
    statusOrId: string | { customFieldItemId: string; name: string },
  ) {
    return this.setCustomFieldUniquely(customFieldOrId, {
      value: [
        typeof statusOrId == 'string'
          ? statusOrId
          : statusOrId.customFieldItemId,
      ],
    });
  }

  setCustomSingleSelectByName(
    customFieldId: CustomFieldOrId<'Single select'>,
    statusName: string | RegExp,
    fieldDefinition:
      | FavroApi.CustomFieldDefinition.Model<'Single select'>
      | BravoCustomFieldDefinition<'Single select'>
      | BravoCustomField<'Single select'>,
  ) {
    const status = fieldDefinition.customFieldItems!.find(
      createIsMatchFilter(statusName, 'name'),
    );
    this.assert(
      status,
      `No status matching ${statusName} found on custom field ${customFieldId}`,
    );
    return this.setCustomSingleSelect(customFieldId, status.customFieldItemId);
  }

  setCustomText(customFieldId: CustomFieldOrId<'Text'>, text: string) {
    this.assert(
      typeof text == 'string' && text,
      `"${text}" is not a valid string`,
    );
    this.setCustomFieldUniquely(customFieldId, { value: text });
  }

  setCustomNumber(customFieldId: CustomFieldOrId<'Number'>, number: number) {
    this.assert(
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
    rating: FavroApi.CustomFieldValue.ModelFieldValue.Rating,
  ) {
    return this.setCustomFieldUniquely(customFieldId, { total: rating });
  }

  setCustomMultipleSelect(
    customFieldOrId: CustomFieldOrId<'Multiple select'>,
    optionOrIds: (string | { customFieldItemId: string; name: string })[],
  ) {
    return this.setCustomFieldUniquely(customFieldOrId, {
      value: optionOrIds.map((o) =>
        typeof o == 'string' ? o : o.customFieldItemId,
      ),
    });
  }

  setCustomMultipleSelectByName(
    customFieldOrId: CustomFieldOrId<'Multiple select'>,
    optionNames: (string | RegExp)[],
    fieldDefinition:
      | FavroApi.CustomFieldDefinition.Model<'Multiple select'>
      | BravoCustomFieldDefinition<'Multiple select'>
      | BravoCustomField<'Multiple select'>,
  ) {
    this.assert(optionNames.length > 0, 'No option names provided');
    const matchingOptions = fieldDefinition.customFieldItems!.filter((item) =>
      optionNames.some((name) => isMatch(item.name, name)),
    );
    this.assert(
      matchingOptions.length === optionNames.length,
      `Expected to find ${optionNames.length} matching options, but found ${matchingOptions.length}.`,
    );
    return this.setCustomMultipleSelect(
      customFieldOrId,
      matchingOptions.map((o) => o.customFieldItemId),
    );
  }

  // TODO: Map these onto Card methods & test
  private updateCustomMembers(
    customFieldOrId: CustomFieldOrId<'Members'>,
    members: (string | BravoUser)[],
    action: 'add' | 'remove' | 'complete' | 'uncomplete',
  ) {
    const userIds = stringsOrObjectsToStrings(members, 'userId');
    const customFieldId =
      typeof customFieldOrId == 'string'
        ? customFieldOrId
        : customFieldOrId.customFieldId;
    let update = this.update.customFields.find(
      (f) => f.customFieldId == customFieldId,
    ) as FavroApi.CustomFieldValue.UpdateBody<'Members'> | undefined;
    if (!update) {
      update = {
        customFieldId,
        members: {
          addUserIds: [],
          removeUserIds: [],
          completeUsers: [],
        },
      };
      this.update.customFields.push(update);
    }
    if (action == 'add') {
      update.members.addUserIds = userIds;
    } else if (action == 'remove') {
      update.members.removeUserIds = userIds;
    } else if (action == 'complete') {
      addToUniqueArrayBy(
        update.members.completeUsers,
        'userId',
        userIds.map((u) => ({ userId: u, completed: true })),
      );
    } else if (action == 'uncomplete') {
      addToUniqueArrayBy(
        update.members.completeUsers,
        'userId',
        userIds.map((u) => ({ userId: u, completed: false })),
      );
    }
    return this;
  }

  addCustomMembers(
    customFieldOrId: CustomFieldOrId<'Members'>,
    users: (string | BravoUser)[],
  ) {
    return this.updateCustomMembers(customFieldOrId, users, 'add');
  }

  removeCustomMembers(
    customFieldOrId: CustomFieldOrId<'Members'>,
    users: (string | BravoUser)[],
  ) {
    return this.updateCustomMembers(customFieldOrId, users, 'remove');
  }

  completeCustomMembers(
    customFieldOrId: CustomFieldOrId<'Members'>,
    users: (string | BravoUser)[],
  ) {
    return this.updateCustomMembers(customFieldOrId, users, 'complete');
  }

  uncompleteCustomMembers(
    customFieldOrId: CustomFieldOrId<'Members'>,
    users: (string | BravoUser)[],
  ) {
    return this.updateCustomMembers(customFieldOrId, users, 'uncomplete');
  }

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
  private addToUniqueArray<Field extends BravoCardFieldWithArrayValue>(
    updateField: Field,
    values: FavroApi.Card.UpdateBody[Field],
    opposingField?: BravoCardFieldWithArrayValue,
  ) {
    this.update[updateField] ||= [];
    ensureArrayExistsAndAddUnique(this.update[updateField], values);
    if (opposingField) {
      removeFromArray(this.update[opposingField], values);
    }
    return this;
  }
}
