export namespace FavroApiData {
  export namespace Tag {
    export namespace Option {
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
    }

    /** {@link https://favro.com/developer/#tag} */
    export interface Definition {
      tagId: string;
      organizationId: string;
      name: string;
      color: Option.Color;
    }
  }
}
