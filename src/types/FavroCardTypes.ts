import type { DataFavroCardField } from './FavroCustomFieldTypes.js';
import type { OptionFavroTagColor } from './FavroTagTypes.js';
import type { OptionWidgetType } from './FavroWidgetTypes.js';

/** {@link https://favro.com/developer/#card-assignment} */
interface DataFavroCardAssignment {
  userId: string;
  completed: boolean;
}

/** {@link https://favro.com/developer/#card-task} */
interface DataFavroCardTask {
  name: string;
  completed: boolean;
}

/** {@link https://favro.com/developer/#card-custom-fields} */
interface DataFavroCardCustomField {
  customFieldId: string;
  value: DataFavroCardField;
}

/**
 * @note This type has no clear reference in the docs
 *
 * {@link https://favro.com/developer/#card-tasklist}
 */
interface DataFavroCardTasklist {
  name: string;
  tasks: (DataFavroCardTask | string)[];
}

/** {@link https://favro.com/developer/#card-tag} */
interface DataFavroCardTag {
  name: string;
  color: OptionFavroTagColor;
}

/** {@link https://favro.com/developer/#card-attachment} */
interface DataFavroCardAttachment {
  name: string;
  fileURL: string;
  thumbnailURL: string;
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

/** {@link https://favro.com/developer/#card} */
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
  widgetCommonId: string;
  /**
   * The user id of the user of the todo list that this card exists in.
   * Only returned if the card exists in a todo list. Otherwise
   * widgetCommonId will be returned. */
  todoListUserId: string;
  /**
   * Returns 'true' if the card exists in a todo list and has
   * been completed by that user. */
  todoListCompleted: boolean;
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
  tags: DataFavroCardTag[];
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
