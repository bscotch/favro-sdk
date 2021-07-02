/**
 * {@link https://favro.com/developer/#column-object}
 */
export interface DataFavroColumn {
  /** The id of the column. */
  columnId: string;
  /** The id of the organization that this column exists in. */
  organizationId: string;
  /** The common id of the widget that this column exists on. */
  widgetCommonId: string;
  /** The name of the column. */
  name: string;
  /** The position of the column on the widget. */
  position: number;
  /** Total number of cards on the column. */
  cardCount: number;
  /** Summary time spent of cards on the column in milisecond. */
  timeSum: number;
  /** Summary estimation of cards on the column. */
  estimationSum: number;
}
