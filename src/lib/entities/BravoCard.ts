import type {
  DataFavroCard,
  DataFavroCardFavroAttachment,
} from '$/types/FavroCardTypes.js';
import type {
  FavroApiParamsCardUpdate,
  FavroApiParamsCardUpdateArrayField,
} from '$/types/FavroCardUpdateTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { assertBravoClaim } from '../errors.js';
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
    ensureArrayExistsAndAddUnique(this.update[updateField], values);
    if (opposingField) {
      removeFromArray(this.update[opposingField], values);
    }
    return this;
  }
}

// TODO: Add a Favro-global-scope Card class as a base
//       for specific Instances. (Still need to think through
//       details of the data model...)

/**
 * A Card "Instance" represents the combination of a Card's
 * *global* data and its data associated with a specific Widget.
 */
export class BravoCardInstance extends BravoEntity<DataFavroCard> {
  private _updateBuilder = new BravoCardUpdateBuilder();

  get name() {
    return this._data.name;
  }

  /**
   * The number shown in the card UI,
   * and used in user-friendly URLs. */
  get sequentialId() {
    return this._data.sequentialId;
  }

  /**
   * A user-friendly URL for the card.
   * It is not associated with a specific Collection,
   * so the Favro App will choose which collection to
   * open the card in.
   */
  get url() {
    return `https://favro.com/organization/${this._client.organizationId}?card=${this.sequentialId}`;
  }

  get assignments() {
    return [...this._data.assignments];
  }

  /**
   * The card's Widget-specific ID.
   */
  get cardId() {
    return this._data.cardId;
  }

  /**
   * The card's global ID, the same in all widgets in
   * which this card appears
   */
  get cardCommonId() {
    return this._data.cardCommonId;
  }

  /**
   * The column this card appears in (i.e. the status it has)
   * on the current widget. */
  get columnId() {
    return this._data.columnId;
  }

  get parentCardId() {
    return this._data.parentCardId;
  }

  /**
   * The widget that the current instance of this
   * card appears in. (A single card can live in,
   * and be fetched from, multiple Widgets.)
   */
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

  get startDate() {
    if (this._data.startDate) {
      return new Date(this._data.startDate);
    }
    return null;
  }

  get dueDate() {
    if (this._data.dueDate) {
      return new Date(this._data.dueDate);
    }
    return null;
  }

  get archived() {
    return this._data.archived;
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
   * Get the hydrated Column object for the Column (a.k.a. Status)
   * this card is in.
   */
  async getColumn() {
    assertBravoClaim(
      this.widgetCommonId,
      'This Card instance does not have a columnId (it is not in a Widget).',
    );
    return await this._client.findColumnById(
      this.widgetCommonId,
      this.columnId,
    );
  }

  /**
   * Submit an update to Favro for this card.
   * If no argument is provided, uses
   * any changes made via this instance's `.updateBuilder` methods.
   */
  async update(data?: FavroApiParamsCardUpdate) {
    // TODO: Handle Custom Fields
    // TODO: Handle adding Attachments
    data ||= this.updateBuilder.toJSON();
    // Replace the update builder immediately, since
    // we then have to wait for the update to occur
    // the the user might want to start building a new update
    // before that returns.
    this._updateBuilder = new BravoCardUpdateBuilder();
    const updated = await this._client.updateCardById(this.cardId, data);
    // Update this card!
    this._data = updated._data;
    return this;
  }

  /**
   * Upload an attachment to this card.
   * @param data  If not provided, assumes `filename` exists and
   *              attempts to use its content.
   */
  async attach(filename: string, data?: string | Buffer) {
    const attachment = await this._client.addAttachmentToCard(
      this.cardId,
      filename,
      data,
    );
    this._data.attachments.push(attachment);
    return { ...attachment };
  }

  /**
   * Re-fetch the data for this card so that its local
   * data is up-to-date.
   */
  async refresh() {
    this._updateBuilder = new BravoCardUpdateBuilder();
    const refreshed = await this._client.findCardInstanceById(this.cardId);
    this._data = refreshed._data;
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

  equals(org: BravoCardInstance) {
    return (
      this.hasSameConstructor(org) && this.cardCommonId === org.cardCommonId
    );
  }
}
