import type {
  DataFavroCardFieldNumber,
  DataFavroCardFieldText,
  DataFavroCardFieldStatus,
  DataFavroCardFieldMultipleSelect,
  DataFavroCardFieldCheckbox,
  DataFavroCardFieldDate,
  DataFavroCardFieldLink,
  DataFavroCardFieldRating,
  DataFavroCardFieldTimeline,
  DataFavroCardFavroAttachment,
  DataFavroCardFieldTimeUserReport,
} from './FavroCardTypes';

interface DataFavroCardFieldMembersUpdate {
  /** The list of members, that will be added to the card custom field (array of userIds).*/
  addUserIds: string[];
  /** The list of members, that will be removed from card custom field (array of userIds).*/
  removeUserIds: string[];
  /** The list of card assignment, that will update their statuses on the custom field accordingly.*/
  completeUsers: string[];
}
interface DataFavroCardFieldTagsUpdate {
  /** The list of tag names or card tags that will be added to this card custom field. If the tag does not exist in the organization it will be created.*/
  addTags: string[];
  /** A list of tagIds that will be added to this card custom field.*/
  addTagIds: string[];
  /** The list of tag names, that will be removed from this card custom field.*/
  removeTags: string[];
  /** The list of tag IDs, that will be removed from this card custom field.*/
  removeTagIds: string[];
}

interface DataFavroCardFieldTimeUpdate {
  /** The user report to be added. See custom field time user reports. Optional. */
  addUserReports: DataFavroCardFieldTimeUserReport;
  /** The user report to be updated. See custom field time user reports. Optional. */
  updateUserReports: DataFavroCardFieldTimeUserReport;
  /** The user report to be removed. See custom field time user reports. Optional */
  removeUserReports: DataFavroCardFieldTimeUserReport;
}

interface DataFavroCardFieldVoteUpdate {
  /**
   * The value to determine the field should be either voted or unvoted.
   *
   * @note It's unclear if this refers to the CURRENT user (the one who
   * ownes the API token). Presumably it does?
   */
  value: boolean;
}

/**
 * These strongly overlap, but are not identical to, the CustomField
 * object shapes returned by the API.
 *
 * {@link https://favro.com/developer/#card-custom-field-parameters}
 */
export type FavroApiParamsCardUpdateCustomField = { customFieldId: string } & (
  | DataFavroCardFieldCheckbox
  | DataFavroCardFieldDate
  | DataFavroCardFieldLink
  | DataFavroCardFieldMultipleSelect
  | DataFavroCardFieldNumber
  | DataFavroCardFieldRating
  | DataFavroCardFieldStatus
  | DataFavroCardFieldText
  | DataFavroCardFieldTimeline
  | DataFavroCardFieldMembersUpdate
  | DataFavroCardFieldTagsUpdate
  | DataFavroCardFieldTimeUpdate
  | DataFavroCardFieldVoteUpdate
);

/**
 * Body parameters for updating a Card.
 *
 * Note that `cardId` must be specified in the URL,
 * and `descriptionFormat` should be set to `'markdown'`
 * in the query params so that the returned result will
 * have a Markdown body.
 *
 * {@link https://favro.com/developer/#update-a-card}
 */
export interface FavroApiParamsCardUpdate {
  /** The name of the card. */
  name?: string;
  /** The detailed description of the card. Supports formatting. */
  detailedDescription?: string;
  /** The widgetCommonId to commit the card in (if adding to a Widget). */
  widgetCommonId?: string;
  /** The columnId to commit the card in. It must belong to the widget specified in the widgetCommonId parameter. */
  columnId?: string;
  /** The laneId to commit the card in. This is only applicable if creating the card on a widget that has lanes enabled. */
  laneId?: string;
  /** The id of the parent card in the card hierarchy (sheet or card list), where the card will be commited. It must belong to the widget specified in the widgetCommonId parameter. */
  parentCardId?: string;
  /** 'commit' to commit card, 'move' to move card. 'commit' by default. */
  dragMode?: 'commit' | 'move';
  /**
   * @deprecated
   * Mapped to listPosition for right-pane widgets, and to sheetPosition for left-pane widgets.
   */
  position?: number;
  /** New position of the card in a column on a Kanban board, or in a todo list. */
  listPosition?: number;
  /** New position of the card in a hierarchical view (sheet or card list).*/
  sheetPosition?: number;
  /** The list of assignments, that will be added to card (array of userIds).*/
  addAssignmentIds?: string[];
  /** The list of assignments, that will be removed from card (array of userIds).*/
  removeAssignmentIds?: string[];
  /** The list of card assignment, that will update their statuses accordingly.*/
  completeAssignments?: string[];
  /** The list of tag names or card tags that will be added to the card. If the tag does not exist in the organization it will be created.*/
  addTags?: string[];
  /** A list of tagIds that will be added to card.*/
  addTagIds?: string[];
  /** The list of tag names, that will be removed from card.*/
  removeTags?: string[];
  /** The list of tag IDs, that will be removed from card.*/
  removeTagIds?: string[];
  /** The start date of card. Format ISO-8601. If null, start date will be removed.*/
  startDate?: string;
  /** The due date of card. Format ISO-8601. If null, due date will be removed.*/
  dueDate?: string;
  /** The list of card tasklists, that will be added to card.*/
  addTasklists?: {
    name: string;
    tasks: (string | { name: string; completed?: boolean })[];
  }[];
  /**
   * The list of card attachments URLs, that will be removed from the card.
   *
   * @note Unclear what URL is being referenced here. Best guess is the
   * `fileURL` field from an attachment object.
   */
  removeAttachments?: string[];
  /**
   * The list of card custom field parameters, that will be added or modified.
   *
   * @note Value objects are VERY similar to those that appear in the same
   * field upon fetching a Card, but there are some differences.
   */
  customFields?: unknown[];
  /** The list of card favro attachment that will be added to the card.*/
  addFavroAttachments?: DataFavroCardFavroAttachment[];
  /**
   * The list of cardCommonId and widgetCommonId of card
   * favro attachment, that will be removed from the card.
   *
   * @note Presumably this is the `itemCommonId` field value
   */
  removeFavroAttachmentIds?: string[];
  /** Archive or unarchive card.*/
  archive: boolean;
}
