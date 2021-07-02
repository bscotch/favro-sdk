import type { OptionWidgetColor } from '$entities/BravoWidget.js';
import type { OptionWidgetRole, OptionWidgetType } from './FavroWidgetTypes.js';

export interface OptionsBravoCreateWidget {
  /** Defaults to 'backlog' */
  type?: OptionWidgetType;
  color?: OptionWidgetColor;
  /** Defaults to 'fullMembers' */
  ownerRole?: OptionWidgetRole;
  /** Defaults to 'guests' */
  editRole?: OptionWidgetRole;
}
