import type {
  DataFavroCard,
  DataFavroCardFavroAttachment,
  DataFavroCustomFieldType,
} from '$/types/FavroCardTypes.js';
import type {
  FavroApiParamsCardUpdate,
  FavroApiParamsCardUpdateArrayField,
} from '$/types/FavroCardUpdateTypes.js';
import { ExtractKeysByValue } from '$/types/Utility.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { assertBravoClaim } from '../errors.js';
import {
  ensureArrayExistsAndAddUnique,
  ensureArrayExistsAndAddUniqueBy,
  isMatch,
  removeFromArray,
  stringsOrObjectsToStrings,
  wrapIfNotArray,
} from '../utility.js';
import type { BravoColumn } from './BravoColumn.js';
import {
  BravoCustomField,
  BravoCustomFieldDefinition,
} from './BravoCustomField.js';
import type { BravoUser } from './users.js';

/**
 * A Card update can be pretty complex, and to save API
 * calls its best to do all desired updates in one go
 * where possible. The Update Builder makes it (relatively)
 * easy to construct a complex update with a chaining-based
 * approach.
 */
export class BravoCardUpdateBuilder {
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

/**
 * A Card "Instance" represents the combination of a Card's
 * *global* data and its data associated with a specific Widget.
 */
export class BravoCardInstance extends BravoEntity<DataFavroCard> {
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
   * The widget that the current instance of this
   * card appears in. (A single card can live in,
   * and be fetched from, multiple Widgets.)
   */
  get widgetCommonId() {
    return this._data.widgetCommonId;
  }

  /**
   * The list of tag IDs associated with this card.
   */
  get tags() {
    return [...this._data.tags];
  }

  get detailedDescription() {
    return this._data.detailedDescription;
  }

  /**
   * The column this card appears in (i.e. the status it has)
   * on the current widget. */
  get columnId() {
    return this._data.columnId;
  }

  /**
   * Get the raw Custom Field IDs and values associated
   * with this card. (These are global, not per-Widget.)
   *
   * These are typically a collection of IDs and values.
   * For more human-friendly versions, with hydrated classes
   * populating all of the info,
   * see {@link BravoCardInstance.getCustomFields}.
   */
  get customFieldsValuesRaw() {
    return this._data.customFields ? [...this._data.customFields] : [];
  }

  get parentCardId() {
    return this._data.parentCardId;
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

  //#region UPDATE SHORTCUTS FOR INDIVIDUAL FIELDS
  private async updateCommonField<
    Method extends ExtractKeysByValue<
      BravoCardUpdateBuilder,
      (...args: any[]) => any
    >,
  >(method: Method, ...args: Parameters<BravoCardUpdateBuilder[Method]>) {
    const updateBuilder = new BravoCardUpdateBuilder();
    //@ts-ignore
    updateBuilder[method](...args);
    await this.update(updateBuilder);
    return this;
  }

  async setName(...args: Parameters<BravoCardUpdateBuilder['setName']>) {
    return await this.updateCommonField('setName', ...args);
  }

  async setDescription(
    ...args: Parameters<BravoCardUpdateBuilder['setDescription']>
  ) {
    return await this.updateCommonField('setDescription', ...args);
  }

  async assign(...args: Parameters<BravoCardUpdateBuilder['assign']>) {
    return await this.updateCommonField('assign', ...args);
  }

  async unassign(...args: Parameters<BravoCardUpdateBuilder['unassign']>) {
    return await this.updateCommonField('unassign', ...args);
  }

  async completeAssignment(
    ...args: Parameters<BravoCardUpdateBuilder['completeAssignment']>
  ) {
    return await this.updateCommonField('completeAssignment', ...args);
  }

  async uncompleteAssignment(
    ...args: Parameters<BravoCardUpdateBuilder['uncompleteAssignment']>
  ) {
    return await this.updateCommonField('uncompleteAssignment', ...args);
  }

  async addTagsByName(
    ...args: Parameters<BravoCardUpdateBuilder['addTagsByName']>
  ) {
    return await this.updateCommonField('addTagsByName', ...args);
  }

  async removeTagsByName(
    ...args: Parameters<BravoCardUpdateBuilder['removeTagsByName']>
  ) {
    return await this.updateCommonField('removeTagsByName', ...args);
  }

  async addTagsById(
    ...args: Parameters<BravoCardUpdateBuilder['addTagsById']>
  ) {
    return await this.updateCommonField('addTagsById', ...args);
  }

  async removeTagsById(
    ...args: Parameters<BravoCardUpdateBuilder['removeTagsById']>
  ) {
    return await this.updateCommonField('removeTagsById', ...args);
  }

  async setStartDate(
    ...args: Parameters<BravoCardUpdateBuilder['setStartDate']>
  ) {
    return await this.updateCommonField('setStartDate', ...args);
  }

  async unsetStartDate(
    ...args: Parameters<BravoCardUpdateBuilder['unsetStartDate']>
  ) {
    return await this.updateCommonField('unsetStartDate', ...args);
  }

  async setDueDate(...args: Parameters<BravoCardUpdateBuilder['setDueDate']>) {
    return await this.updateCommonField('setDueDate', ...args);
  }

  async unsetDueDate(
    ...args: Parameters<BravoCardUpdateBuilder['unsetDueDate']>
  ) {
    return await this.updateCommonField('unsetDueDate', ...args);
  }

  async removeAttachments(
    ...args: Parameters<BravoCardUpdateBuilder['removeAttachments']>
  ) {
    return await this.updateCommonField('removeAttachments', ...args);
  }

  async addFavroAttachments(
    ...args: Parameters<BravoCardUpdateBuilder['addFavroAttachments']>
  ) {
    return await this.updateCommonField('addFavroAttachments', ...args);
  }

  async removeFavroAttachmentsById(
    ...args: Parameters<BravoCardUpdateBuilder['removeFavroAttachmentsById']>
  ) {
    return await this.updateCommonField('removeFavroAttachmentsById', ...args);
  }

  async archive(...args: Parameters<BravoCardUpdateBuilder['archive']>) {
    return await this.updateCommonField('archive', ...args);
  }

  async unarchive(...args: Parameters<BravoCardUpdateBuilder['unarchive']>) {
    return await this.updateCommonField('unarchive', ...args);
  }

  async addToWidget(
    ...args: Parameters<BravoCardUpdateBuilder['addToWidget']>
  ) {
    return await this.updateCommonField('addToWidget', ...args);
  }
  //#endregion

  /**
   * Get the custom field definitions and values associated with
   * this card.
   *
   * (Note that these are *sparse* -- only fields for which this
   * card has a value are returned.)
   */
  async getCustomFields() {
    const cardCustomFields: BravoCustomField<any>[] = [];
    const definitions = await this._client.listCustomFieldDefinitions();
    // Loop over the values set on this card and find the associated
    // definitions.
    for (const value of this.customFieldsValuesRaw) {
      const definition = await definitions.findById(
        'customFieldId',
        value.customFieldId,
      );
      assertBravoClaim(
        definition,
        `Could not find Custom Field with ID ${value.customFieldId}`,
      );
      cardCustomFields.push(new BravoCustomField(definition, value));
    }
    return cardCustomFields;
  }

  /**
   * Get the current value of a Custom Status Field on this card,
   * including field definition information. If the field is not
   * set, will still return the definition with the value set to
   * `undefined`.
   *
   * > 💡 *Note that this method (using `customFieldId`) is the
   * only way to guarantee the desired field, since all Custom
   * Fields are global in the Favro API.*
   */
  async getCustomFieldByFieldId<
    FieldType extends DataFavroCustomFieldType = any,
  >(customFieldId: string) {
    const setFields = await this.getCustomFields();
    const matchingField = setFields.find(
      (field) => field.customFieldId == customFieldId,
    );
    if (matchingField) {
      return matchingField as BravoCustomField<FieldType>;
    }
    // Otherwise this field either doesn't exist or is not set on this card.
    // Find it from the global pool.
    const definition = await this._client.findCustomFieldDefinitionById(
      customFieldId,
    );
    return new BravoCustomField<FieldType>(definition);
  }

  /**
   * Get the current value of a Custom Status Field on this card,
   * searching by the Custom Field `name` and type `type`.
   *
   * > ⚠ Since Custom Fields are global in Favro, names can be changed,
   * and names may not be unique, this method has caveats. Read the rest
   * of this doc to fully understand them, and otherwise use the safer
   * {@link getCustomFieldByFieldId} where possible.
   *
   * This method only returns a `BravoCustomField` instance if
   * *either* of the following are true:
   *
   * - Exactly one field of type `type` on this Card matches the `name`; or
   * - Exactly one of all of the Organization's Custom Fields of type `type` matches the `name`.
   *
   * If neither of these are true, then it is not possible for
   * this method to guarantee returning the desired field and so
   * an error will be thrown.
   *
   */
  async getCustomFieldByName<FieldType extends DataFavroCustomFieldType = any>(
    name: string | RegExp,
    type: FieldType,
  ) {
    // Check the fields ON the Card first.
    const fieldDefsOnCard = await this.getCustomFields();
    const matchFilter = (
      field: BravoCustomField<any> | BravoCustomFieldDefinition<FieldType>,
    ) => {
      return field.type === type && isMatch(field.name, name);
    };
    const matchingFieldsOnCard = fieldDefsOnCard.filter(matchFilter);
    if (matchingFieldsOnCard.length === 1) {
      return matchingFieldsOnCard[0] as BravoCustomField<FieldType>;
    }
    assertBravoClaim(
      matchingFieldsOnCard.length == 0,
      `Multiple Custom Fields on the Card match the name ${name} on this card.`,
    );

    // If exactly one Custom Field in the whole Organization matches,
    // we're still giving the user what they want. (Probably.)
    const allDefinitions = await this._client.listCustomFieldDefinitions();
    const matchingDefinitions: BravoCustomField<FieldType>[] = [];
    for await (const definition of allDefinitions) {
      if (matchFilter(definition)) {
        matchingDefinitions.push(new BravoCustomField(definition));
        assertBravoClaim(
          matchingDefinitions.length == 1,
          'No matching fields found on the Card, ' +
            'but more than one found in the global list of Custom Fields',
        );
      }
    }
    assertBravoClaim(
      matchingDefinitions.length === 1,
      'No matching fields found',
    );
    return matchingDefinitions[0];
  }

  /**
   * Get the list of Columns (statuses) that this Card Instance
   * could be assigned to on its current Widget.
   */
  async listWidgetColumns() {
    assertBravoClaim(
      this.widgetCommonId,
      'This card is not on a Widget can cannot have assignable Columns',
    );
    return await this._client.listColumns(this.widgetCommonId);
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
   * Set this Card's Column to a different one
   */
  async setColumn(columnId: string): Promise<BravoCardInstance>;
  async setColumn(column: BravoColumn): Promise<BravoCardInstance>;
  async setColumn(
    columnOrColumnId: BravoColumn | string,
  ): Promise<BravoCardInstance> {
    const columnId =
      typeof columnOrColumnId === 'string'
        ? columnOrColumnId
        : columnOrColumnId.columnId;
    const widgetCommonId =
      typeof columnOrColumnId === 'string'
        ? this.widgetCommonId
        : columnOrColumnId.widgetCommonId;
    assertBravoClaim(columnId, 'No valid ColumnId provided');
    await this.update({ columnId, widgetCommonId });
    return this;
  }

  /**
   * Submit an update to Favro for this card.
   * If no argument is provided, uses
   * any changes made via this instance's `.updateBuilder` methods.
   */
  async update(data: FavroApiParamsCardUpdate | BravoCardUpdateBuilder) {
    if (data instanceof BravoCardUpdateBuilder) {
      data = data.toJSON();
    }
    const updated = await this._client.updateCardInstanceByCardId(
      this.cardId,
      data,
    );
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
    const attachment = await this._client.addAttachmentToCardInstance(
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
    const refreshed = await this._client.findCardInstanceByCardId(this.cardId);
    this._data = refreshed._data;
    return this;
  }

  /**
   * Delete this card from its Widget (the one it
   * was fetched from in search results). Optionally
   * delete it everywhere else, too!
   */
  async delete(everywhere = false) {
    return this._client.deleteCardInstance(this.cardId, everywhere);
  }

  createNewUpdateBuilder() {
    return new BravoCardUpdateBuilder();
  }

  equals(org: BravoCardInstance) {
    return (
      this.hasSameConstructor(org) && this.cardCommonId === org.cardCommonId
    );
  }
}
