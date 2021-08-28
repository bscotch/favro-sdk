export namespace FavroDataTypes {
  export namespace Tag {
    /** {@link https://favro.com/developer/#tag-colors} */
    export type Color =
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
    export interface Definition {
      tagId: string;
      organizationId: string;
      name: string;
      color: Color;
    }
  }
}
