import type { OptionWidgetType } from './FavroWidgetTypes.js';

export type OptionFavroDescriptionFormat = 'plaintext' | 'markdown';

export type FavroApiParamsCardCreate = Partial<
  Omit<DataFavroCard, 'cardId' | 'organizationId'>
> & {
  name: string;
  /**
   * Require posting a card to a Widget (the API allows *not* doing
   * that, but that seems like it would create more trouble than it's worth) */
  widgetCommonId: string;
  descriptionFormat?: OptionFavroDescriptionFormat;
};

export interface FavroApiGetCardsBase {
  /** Limit the search scope to a specific column */
  columnId?: string;
  /**
   * Apparently cards can be returned multiple times
   * in a single request, since they can live in multiple
   * places depending on scope of the search. The API
   * defaults to `false`.
   */
  unique?: boolean;
  /**
   * The API defaults to `'plaintext'` for some reason...
   */
  descriptionFormat?: OptionFavroDescriptionFormat;
}

export interface FavroApiGetCardsByCardCommonId extends FavroApiGetCardsBase {
  cardCommonId: string;
}

export interface FavroApiGetCardsByWidgetCommonId extends FavroApiGetCardsBase {
  widgetCommonId: string;
}

export interface FavroApiGetCardsByCollectionId extends FavroApiGetCardsBase {
  collectionId: string;
}

export type FavroApiGetCardsParams =
  | FavroApiGetCardsByCardCommonId
  | FavroApiGetCardsByWidgetCommonId
  | FavroApiGetCardsByCollectionId;

// FOR SETTING VALUES ON A CARD

interface DataFavroCustomFieldMembers {
  /** The list of members, that will be added to the card custom field (array of userIds).*/
  addUserIds: string[];
  /** The list of members, that will be removed from card custom field (array of userIds).*/
  removeUserIds: string[];
  /** The list of card assignment, that will update their statuses on the custom field accordingly.*/
  completeUsers: string[];
}
interface DataFavroCustomFieldTags {
  /** The list of tag names or card tags that will be added to this card custom field. If the tag does not exist in the organization it will be created.*/
  addTags: string[];
  /** A list of tagIds that will be added to this card custom field.*/
  addTagIds: string[];
  /** The list of tag names, that will be removed from this card custom field.*/
  removeTags: string[];
  /** The list of tag IDs, that will be removed from this card custom field.*/
  removeTagIds: string[];
}

/**
 *
 *
 * {@link https://favro.com/developer/#card-custom-fields}
 */
export type DataFavroCardCustomField = { customFieldId: string } & (
  | DataFavroCardFieldCheckbox
  | DataFavroCardFieldDate
  | DataFavroCardFieldLink
  | DataFavroCardFieldMembers
  | DataFavroCardFieldMultipleSelect
  | DataFavroCardFieldNumber
  | DataFavroCardFieldRating
  | DataFavroCardFieldStatus
  | DataFavroCardFieldTags
  | DataFavroCardFieldText
  | DataFavroCardFieldTime
  | DataFavroCardFieldTimeline
  | DataFavroCardFieldVote
);

interface DataFavroCardFieldNumber {
  /** The total value of the field. */
  total: number;
}
interface DataFavroCardFieldTime {
  /** The total value of all time reported by all users. */
  total: number;
  /**
   * The values reported by each user.
   * The object key represents the userId of the user.
   * The value is an array of user entries. Refer to custom field time user reports. */
  reports: {
    [userId: string]: {
      /** The id of the user entry. */
      reportId: string;
      /** The user entry value. Passing 0 will remove report entry. For custom fields with type "Time", this value is in milliseconds. */
      value: number;
      /** The description of the time report entry. */
      description: string;
      /** The report date in ISO format. */
      createdAt: string;
    }[];
  };
}
interface DataFavroCardFieldText {
  /** The value of the field. */
  value: string;
}
interface DataFavroCardFieldRating {
  /** The value of the field. Valid value is integer from 0 to 5. */
  total: 0 | 1 | 2 | 3 | 4 | 5;
}
interface DataFavroCardFieldVote {
  /** The id array of users that vote for the field. */
  value: string[];
}
interface DataFavroCardFieldCheckbox {
  /** The value of the field. */
  value: boolean;
}
interface DataFavroCardFieldDate {
  /** The date value in ISO format. */
  value: string;
}
interface DataFavroCardFieldTimeline {
  /** The value options of the field. See custom field timeline. */
  timeline: {
    /** The value of start date in ISO format. Required. */
    startDate: string;
    /** The value of due date in ISO format. Required. */
    dueDate: string;
    /** The value to determine display text of field should include time or not. */
    showTime: boolean;
  };
}
interface DataFavroCardFieldLink {
  /** The value options of the field. See custom field link. */
  link: {
    /** The url of the field. Required. */
    url: string;
    /** The display text of the field.*/
    text: string;
  };
}
interface DataFavroCardFieldMembers {
  /** The id array of users that are assigned to card. */
  value: string[];
}
interface DataFavroCardFieldTags {
  /** The id array of tags that are added to card. */
  value: string[];
}
interface DataFavroCardFieldStatus {
  /** The id array of item that are added to card. */
  value: string[];
}
interface DataFavroCardFieldMultipleSelect {
  /** The id array of item that are added to card. */
  value: string[];
}

/** {@link https://favro.com/developer/#card-assignment} */
interface DataFavroCardAssignment {
  userId: string;
  completed: boolean;
}

/** {@link https://favro.com/developer/#card-attachment} */
export interface DataFavroCardAttachment {
  name: string;
  fileURL: string;
  thumbnailURL?: string;
}

/** {@link https://favro.com/developer/#card-time-on-board} */
interface DataFavroCardTimeOnBoard {
  /**
   * @note documentation does not include units
   */
  time: number;
  isStopped: boolean;
}

/** {@link https://favro.com/developer/#card-favro-attachment} */
interface DataFavroCardFavroAttachment {
  /**
   * The cardCommonId of card or widgetCommonId of widget that
   * is linked to the card. */
  itemCommonId: string;
  type: 'card' | OptionWidgetType;
}

/**
 * Cards are the key data unit in Favro. The docs are unclear
 * about which fields are available in what contexts (they
 * refer to "these optional fields" in the docs prior to all
 * the params captured below as an interface).
 *
 * Trial and error will be required to figure it all out!
 *
 * {@link https://favro.com/developer/#card}
 */
export interface DataFavroCard {
  /**
   * The id of the card. */
  cardId: string;
  /**
   * The id of the organization that this card exists in. */
  organizationId: string;
  /**
   * The shared id of the widget that this card exists on.
   * Only returned if the card does not exist in a todo list. */
  widgetCommonId?: string;
  /**
   * The user id of the user of the todo list that this card exists in.
   * Only returned if the card exists in a todo list. Otherwise
   * widgetCommonId will be returned. */
  todoListUserId?: string;
  /**
   * Returns 'true' if the card exists in a todo list and has
   * been completed by that user. */
  todoListCompleted?: boolean;
  /**
   * The id of the Kanban column that this card exists in.
   * Only returned if the card exists on a widget. */
  columnId: string;
  /**
   * The id of the lane that this card exists in.
   * Only returned if the card exists on a widget and the widget has lanes enabled. */
  laneId: string;
  /**
   * The id of the parent card in the card hierarchy (sheet or card list).
   * Only returned if the card exists in a widget and is the child of another card. */
  parentCardId: string;
  /**
   * Returns 'true' if the card is a lane. */
  isLane: boolean;
  /**
   * Returns 'true' if the card is archived. */
  archived: boolean;
  /**
   * @deprecated
   * Deprecated. Mapped to listPosition for right-pane widgets,
   * and to sheetPosition for left-pane widgets. */
  position: number;
  /**
   * Position of the card in a column on a Kanban board, or in a todo list. */
  listPosition: number;
  /**
   * Position of the card in a hierarchical view (sheet or card list). */
  sheetPosition: number;
  /**
   * A shared id for all instances of this card in the organization. */
  cardCommonId: string;
  /**
   * The name of the card. */
  name: string;
  /**
   * The detailed description of the card. */
  detailedDescription: string;
  /**
   * The tags that are set on the card.
   * TODO: Find out if these are strings or objects
   */
  tags: string[];
  /**
   * The sequentialId of the card. Useful for creating human readable links. */
  sequentialId: number;
  /**
   * The start date of the card.
   */
  startDate: string;
  /**
   * The due date of the card.
   */
  dueDate: string;
  /**
   * The users assigned to the card and whether or not they have
   * completed the card. */
  assignments: DataFavroCardAssignment[];
  /**
   * The number of comments posted on the card. */
  numComments: number;
  /**
   * The number of tasks on the card. */
  tasksTotal: number;
  /**
   * The number of tasks completed on the card. */
  tasksDone: number;
  /**
   * The file attachments on the card. */
  attachments: DataFavroCardAttachment[];
  /**
   * The custom fields that are set on the card and enabled in
   * the organization. */
  customFields: DataFavroCardCustomField[];
  /**
   * The amount of time card has been on current board. */
  timeOnBoard: DataFavroCardTimeOnBoard;
  /**
   * The detailed summary of time card has been on each column of
   * the current board. The object key represents the columnId of
   * the column, and the value is the amount of time card has
   * been on that column. */
  timeOnColumns: { [columnId: string]: number };
  /** The Favro attachments on the card. See card favro attachment. */
  favroAttachments: DataFavroCardFavroAttachment[];
}

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
   * // TODO
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
