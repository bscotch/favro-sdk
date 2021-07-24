import type {
  DataFavroCard,
  DataFavroCardFavroAttachment,
} from '$/types/FavroCardTypes.js';
import type {
  FavroApiParamsCardUpdate,
  FavroApiParamsCardUpdateArrayField,
} from '$/types/FavroCardUpdateTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import {
  ensureArrayExistsAndAddUnique,
  ensureArrayExistsAndAddUniqueBy,
  removeFromArray,
  wrapIfNotArray,
} from '../utility.js';

/**
 * A Card update can be pretty complex, and to save API
 * calls its best to do all desired updates in one go
 * where possible. The Update Builder makes it (relatively)
 * easy to construct a complex update with a chaining-based
 * approach.
 */
class BravoCardUpdateBuilder {
  private update: FavroApiParamsCardUpdate = {};
  constructor() {}

  setName(name: string) {
    this.update.name = name;
    return this;
  }

  setDescription(description: string) {
    this.update.detailedDescription = description;
    return this;
  }

  assign(userIds: string[]) {
    return this.addToUniqueArray(
      'addAssignmentIds',
      userIds,
      'removeAssignmentIds',
    );
  }

  unassign(userIds: string[]) {
    return this.addToUniqueArray(
      'removeAssignmentIds',
      userIds,
      'addAssignmentIds',
    );
  }

  completeAssignment(userIds: string[]) {
    return this.setAssignmentCompletion(userIds, true);
  }

  uncompleteAssignment(userIds: string[]) {
    return this.setAssignmentCompletion(userIds, false);
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
    ensureArrayExistsAndAddUnique(this.update[updateField], values);
    if (opposingField) {
      removeFromArray(this.update[opposingField], values);
    }
    return this;
  }
}

export class BravoCard extends BravoEntity<DataFavroCard> {
  private _updateBuilder = new BravoCardUpdateBuilder();

  get name() {
    return this._data.name;
  }

  /** The card's ID within a widget */
  get cardId() {
    return this._data.cardId;
  }

  /** The card's global ID, the same in all widgets in which this card appears */
  get cardCommonId() {
    return this._data.cardCommonId;
  }

  get columnId() {
    return this._data.columnId;
  }

  get parentCardId() {
    return this._data.parentCardId;
  }

  get widgetCommonId() {
    return this._data.widgetCommonId;
  }

  get tags() {
    return [...this._data.tags];
  }

  get detailedDescription() {
    return this._data.detailedDescription;
  }

  get attachments() {
    return this._data.attachments;
  }

  /**
   * Get the update-builder for this card, to
   * more easily assemble a complex Card update.
   * The `.update()` command, if run without arguments,
   * uses any changes you've made with the update builder.
   */
  get updateBuilder() {
    return this._updateBuilder;
  }

  /**
   * Submit an update to Favro for this card.
   * If no argument is provided, uses
   * any changes made via this instance's `.updateBuilder` methods.
   */
  async update(data?: FavroApiParamsCardUpdate) {
    // TODO: Handle Custom Fields
    // TODO: Handle adding Attachments
    const updated = await this._client.updateCardById(
      this.cardId,
      data || this.updateBuilder.toJSON(),
    );
    // Update this card!
    this._data = updated._data;
    return this;
  }

  /**
   * Delete this card from its Widget (the one it
   * was fetched from in search results). Optionally
   * delete it everywhere else, too!
   */
  async delete(everywhere = false) {
    return this._client.deleteCard(this.cardId, everywhere);
  }

  equals(org: BravoCard) {
    return (
      this.hasSameConstructor(org) && this.cardCommonId === org.cardCommonId
    );
  }
}
