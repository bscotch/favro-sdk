import type {
  DataFavroCard,
  DataFavroCustomFieldType,
} from '$/types/FavroCardTypes.js';
import type { FavroApiParamsCardUpdate } from '$/types/FavroCardUpdateTypes.js';
import { ExtractKeysByValue } from '$/types/Utility.js';
import { BravoEntity } from '$lib/BravoEntity.js';
import { assertBravoClaim } from '../errors.js';
import { isMatch } from '../utility.js';
import {
  BravoCardUpdateBuilder,
  CustomFieldOrId,
} from './BravoCardUpdateBuilder';
import type { BravoColumn } from './BravoColumn.js';
import {
  BravoCustomField,
  BravoCustomFieldDefinition,
} from './BravoCustomField.js';

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
  private async updateField<
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
    return await this.updateField('setName', ...args);
  }

  async setDescription(
    ...args: Parameters<BravoCardUpdateBuilder['setDescription']>
  ) {
    return await this.updateField('setDescription', ...args);
  }

  async assign(...args: Parameters<BravoCardUpdateBuilder['assign']>) {
    return await this.updateField('assign', ...args);
  }

  async unassign(...args: Parameters<BravoCardUpdateBuilder['unassign']>) {
    return await this.updateField('unassign', ...args);
  }

  async completeAssignment(
    ...args: Parameters<BravoCardUpdateBuilder['completeAssignment']>
  ) {
    return await this.updateField('completeAssignment', ...args);
  }

  async uncompleteAssignment(
    ...args: Parameters<BravoCardUpdateBuilder['uncompleteAssignment']>
  ) {
    return await this.updateField('uncompleteAssignment', ...args);
  }

  async addTagsByName(
    ...args: Parameters<BravoCardUpdateBuilder['addTagsByName']>
  ) {
    return await this.updateField('addTagsByName', ...args);
  }

  async removeTagsByName(
    ...args: Parameters<BravoCardUpdateBuilder['removeTagsByName']>
  ) {
    return await this.updateField('removeTagsByName', ...args);
  }

  async addTagsById(
    ...args: Parameters<BravoCardUpdateBuilder['addTagsById']>
  ) {
    return await this.updateField('addTagsById', ...args);
  }

  async removeTagsById(
    ...args: Parameters<BravoCardUpdateBuilder['removeTagsById']>
  ) {
    return await this.updateField('removeTagsById', ...args);
  }

  async setStartDate(
    ...args: Parameters<BravoCardUpdateBuilder['setStartDate']>
  ) {
    return await this.updateField('setStartDate', ...args);
  }

  async unsetStartDate(
    ...args: Parameters<BravoCardUpdateBuilder['unsetStartDate']>
  ) {
    return await this.updateField('unsetStartDate', ...args);
  }

  async setDueDate(...args: Parameters<BravoCardUpdateBuilder['setDueDate']>) {
    return await this.updateField('setDueDate', ...args);
  }

  async unsetDueDate(
    ...args: Parameters<BravoCardUpdateBuilder['unsetDueDate']>
  ) {
    return await this.updateField('unsetDueDate', ...args);
  }

  async removeAttachments(
    ...args: Parameters<BravoCardUpdateBuilder['removeAttachments']>
  ) {
    return await this.updateField('removeAttachments', ...args);
  }

  async addFavroAttachments(
    ...args: Parameters<BravoCardUpdateBuilder['addFavroAttachments']>
  ) {
    return await this.updateField('addFavroAttachments', ...args);
  }

  async removeFavroAttachmentsById(
    ...args: Parameters<BravoCardUpdateBuilder['removeFavroAttachmentsById']>
  ) {
    return await this.updateField('removeFavroAttachmentsById', ...args);
  }

  async archive(...args: Parameters<BravoCardUpdateBuilder['archive']>) {
    return await this.updateField('archive', ...args);
  }

  async unarchive(...args: Parameters<BravoCardUpdateBuilder['unarchive']>) {
    return await this.updateField('unarchive', ...args);
  }

  async addToWidget(
    ...args: Parameters<BravoCardUpdateBuilder['addToWidget']>
  ) {
    return await this.updateField('addToWidget', ...args);
  }
  //#endregion

  //#region CUSTOM FIELDS

  async setCustomSingleSelect(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomSingleSelect']>
  ) {
    return await this.updateField('setCustomSingleSelect', ...args);
  }

  async setCustomSingleSelectByName(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomSingleSelectByName']>
  ) {
    return await this.updateField('setCustomSingleSelectByName', ...args);
  }

  async setCustomText(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomText']>
  ) {
    return await this.updateField('setCustomText', ...args);
  }

  async setCustomNumber(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomNumber']>
  ) {
    return await this.updateField('setCustomNumber', ...args);
  }

  async setCustomCheckbox(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomCheckbox']>
  ) {
    return await this.updateField('setCustomCheckbox', ...args);
  }

  async setCustomLink(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomLink']>
  ) {
    return await this.updateField('setCustomLink', ...args);
  }

  async setCustomVote(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomVote']>
  ) {
    return await this.updateField('setCustomVote', ...args);
  }

  async setCustomDate(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomDate']>
  ) {
    return await this.updateField('setCustomDate', ...args);
  }

  async setCustomRating(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomRating']>
  ) {
    return await this.updateField('setCustomRating', ...args);
  }

  async setCustomMulipleSelect(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomMulipleSelect']>
  ) {
    return await this.updateField('setCustomMulipleSelect', ...args);
  }

  async setCustomMulipleSelectByName(
    ...args: Parameters<BravoCardUpdateBuilder['setCustomMulipleSelectByName']>
  ) {
    return await this.updateField('setCustomMulipleSelectByName', ...args);
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
  async getCustomField<FieldType extends DataFavroCustomFieldType = any>(
    customFieldOrId: CustomFieldOrId<FieldType>,
  ) {
    const setFields = await this.getCustomFields();
    const customFieldId =
      typeof customFieldOrId == 'string'
        ? customFieldOrId
        : customFieldOrId.customFieldId;
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
   * {@link getCustomField} where possible.
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
