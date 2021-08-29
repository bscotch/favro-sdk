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
   * Cards can be returned multiple times
   * in a single request, but as per-Widget "instances",
   * since they can live in multiple
   * places depending on scope of the search.
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

export interface FavroApiGetCardsBySequentialId extends FavroApiGetCardsBase {
  cardSequentialId: string | number;
}

export type FavroApiGetCardsParams =
  | FavroApiGetCardsByCardCommonId
  | FavroApiGetCardsByWidgetCommonId
  | FavroApiGetCardsByCollectionId
  | FavroApiGetCardsBySequentialId;

// FOR SETTING VALUES ON A CARD

export type DataFavroCustomFieldType =
  | 'Number'
  | 'Time'
  | 'Text'
  | 'Rating'
  | 'Voting'
  | 'Checkbox'
  | 'Date'
  | 'Timeline'
  | 'Link'
  | 'Members'
  | 'Tags'
  | 'Single select'
  | 'Multiple select';

export type DataFavroCustomFieldsValues = {
  Number: DataFavroCardFieldNumber;
  Time: DataFavroCardFieldTime;
  Text: DataFavroCardFieldText;
  Rating: DataFavroCardFieldRating;
  Voting: DataFavroCardFieldVote;
  Checkbox: DataFavroCardFieldCheckbox;
  Date: DataFavroCardFieldDate;
  Timeline: DataFavroCardFieldTimeline;
  Link: DataFavroCardFieldLink;
  Members: DataFavroCardFieldMembers;
  Tags: DataFavroCardFieldTags;
  'Single select': DataFavroCardFieldSingleSelect;
  'Multiple select': DataFavroCardFieldMultipleSelect;
};

/**
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
  | DataFavroCardFieldSingleSelect
  | DataFavroCardFieldTags
  | DataFavroCardFieldText
  | DataFavroCardFieldTime
  | DataFavroCardFieldTimeline
  | DataFavroCardFieldVote
);

export interface DataFavroCardFieldNumber {
  /** The total value of the field. */
  total: number;
}

export type DataFavroRating = 0 | 1 | 2 | 3 | 4 | 5;

export interface DataFavroCardFieldTimeUserReport {
  /** The id of the user entry. */
  reportId: string;
  /** The user entry value. Passing 0 will remove report entry. For custom fields with type "Time", this value is in milliseconds. */
  value: number;
  /** The description of the time report entry. */
  description: string;
  /** The report date in ISO format. */
  createdAt: string;
}
export interface DataFavroCardFieldTime {
  /** The total value of all time reported by all users. */
  total: number;
  /**
   * The values reported by each user.
   * The object key represents the userId of the user.
   * The value is an array of user entries. Refer to custom field time user reports. */
  reports: {
    [userId: string]: DataFavroCardFieldTimeUserReport[];
  };
}
export interface DataFavroCardFieldText {
  /** The value of the field. */
  value: string;
}
export interface DataFavroCardFieldRating {
  /** The value of the field. Valid value is integer from 0 to 5. */
  total: DataFavroRating;
}
export interface DataFavroCardFieldVote {
  /** The id array of users that vote for the field. */
  value: string[];
}
export interface DataFavroCardFieldCheckbox {
  /** The value of the field. */
  value: boolean;
}
export interface DataFavroCardFieldDate {
  /** The date value in ISO format. */
  value: string;
}
export interface DataFavroCardFieldTimeline {
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
export interface DataFavroCardFieldLink {
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
export interface DataFavroCardFieldSingleSelect {
  /** The id array of item that are added to card. */
  value: string[];
}
export interface DataFavroCardFieldMultipleSelect {
  /** The id array of item that are added to card. */
  value: string[];
}

/** {@link https://favro.com/developer/#card-assignment} */
export interface DataFavroCardAssignment {
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
   * @remarks documentation does not include units
   */
  time: number;
  isStopped: boolean;
}

/** {@link https://favro.com/developer/#card-favro-attachment} */
export interface DataFavroCardFavroAttachment {
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
  laneId: string | null;
  /**
   * The id of the parent card in the card hierarchy (sheet or card list).
   * Only returned if the card exists in a widget and is the child of another card. */
  parentCardId: string | null;
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
  startDate: string | null;
  /**
   * The due date of the card.
   */
  dueDate: string | null;
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
