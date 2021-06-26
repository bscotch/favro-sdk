/** Which pane its in: backlog (left) or board (right) */

export type OptionWidgetType = 'backlog' | 'board';
export type OptionWidgetRole = 'owners' | 'fullMembers' | 'guests';
export type OptionWidgetColor =
  | 'blue'
  | 'lightgreen'
  | 'brown'
  | 'purple'
  | 'orange'
  | 'yellow'
  | 'gray'
  | 'red'
  | 'cyan'
  | 'green';

export interface DataFavroWidget {
  /** The shared id of the widget. */
  widgetCommonId: string;
  /** The id of the organization that this widget exists in. */
  organizationId: string;
  /** The ids of the collections that this widget exists in. This array will only contain collections that the user has access to. */
  collectionIds: string[];
  /** The name of the widget. */
  name: string;
  /** The type of the widget. */
  type: OptionWidgetType;
  /** If set, this means that this widget is a breakdown of a card. */
  breakdownCardCommonId: string;
  /** The color of the widget icon. Refer to widget colors. */
  color: OptionWidgetColor;
  /** The users that have ownership of the widget. */
  ownerRole: OptionWidgetRole;
  /** The users that can add, edit and move cards on the widget. */
  editRole: OptionWidgetRole;
}
