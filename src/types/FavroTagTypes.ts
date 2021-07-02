/** {@link https://favro.com/developer/#tag-colors} */
export type OptionFavroTagColor =
  | 'blue'
  | 'purple'
  | 'cyan'
  | 'green'
  | 'lightgreen'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'brown'
  | 'gray'
  | 'slategray';

/** {@link https://favro.com/developer/#tag} */
export interface DataFavroTag {
  tagId: string;
  organizationId: string;
  name: string;
  color: OptionFavroTagColor;
}
