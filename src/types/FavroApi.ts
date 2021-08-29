/**
 * Typings for the data models used by the Favro API.
 * See {@link https://favro.com/developer}
 */
export namespace FavroApi {
  /**
   * The standardized pageable format returned by much of the
   * Favro API {@see https://favro.com/developer/#pagination }.
   *
   * @template DataEntity The shape of the data structure specific to
   *                      the endpoint being paginated.
   */
  export interface ResponsePaged<DataEntity extends Record<string, any>> {
    /** The maximum number of return results */
    limit: number;
    /** Which page of results we're on */
    page: number;
    /** Total number of pages returned by this request */
    pages: number;
    /** A unique identifer for the request */
    requestId: string;
    /**
     * The returned entities from this page, in whatever
     * data structure makes sense for the endpoint
     */
    entities: DataEntity[];
    /**
     * In some scenarios we get back an object with just
     * this field despite have a normal status code.*/
    message?: string;
  }

  /**
   * All-encompassing form of the possible responses from the Favro API,
   * including singleton and pageable responses.
   */
  export type Response<EntityData extends Record<string, any>> =
    | ResponsePaged<EntityData>
    | EntityData;

  /**
   * A Favro "Organization" represents the functional unit by which
   * users and projects are organized. It's the top level of access.
   * A user's API token can be used on any of their organizations.
   */
  export namespace Organization {
    /**
     * Helper types for the values of {@link Organization.Data} fields.
     */
    export namespace FieldTypes {
      export type Role =
        | 'administrator'
        | 'fullMember'
        | 'externalMember'
        | 'guest'
        | 'disabled';
      export interface Member {
        userId: string;
        role: Role;
        joinDate: string;
      }
    }

    /**
     * The data model returned by the Favro API for Organizations.
     */
    export interface Data {
      organizationId: string;
      name: string;
      sharedToUsers: FieldTypes.Member[];
    }
  }

  /** Favro API Data model for Collections. */
  export namespace Collection {
    /**
     * Helper types for the values of {@link Collection.Data} fields.
     */
    export namespace FieldTypes {
      export type ColorBackground =
        | 'purple'
        | 'green'
        | 'grape'
        | 'red'
        | 'pink'
        | 'blue'
        | 'solidPurple'
        | 'solidGreen'
        | 'solidGrape'
        | 'solidRed'
        | 'solidPink'
        | 'solidGray';
      export type Visibility = 'users' | 'organization' | 'public';
      export type Role = 'guest' | 'view' | 'edit' | 'admin';
      export interface Member {
        userId: string;
        role: Role;
      }
    }

    /** {@link https://favro.com/developer/#collections} */
    export interface Data {
      /** The id of the collection. */
      collectionId: string;
      /** The id of the organization that this collection exists in. */
      organizationId: string;
      /** The name of the collection. */
      name: string;
      /** The array of collection members that the collection is shared to. */
      sharedToUsers: FieldTypes.Member[];
      /** The collection public sharing level. */
      publicSharing: FieldTypes.Visibility;
      /** The collection background. */
      background: FieldTypes.ColorBackground;
      /** Whether or not the collection is archived. */
      archived: boolean;
      /** Whether or not full members shared this collection can create new widgets. */
      fullMembersCanAddWidgets: boolean;
    }
  }

  /** Favro API Data models for Users */
  export namespace User {
    /**
     * Helper types for the values of {@link User.Data}
     */
    export namespace FieldTypes {}
    export interface Data {
      userId: string;
      name: string;
      email: string;
      organizationRole: Organization.FieldTypes.Role;
    }
  }

  /**
   * Favro tags are global to an organization.
   */
  export namespace Tag {
    export namespace FieldTypes {
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

    /**
     * The data model for a Tag returned from the Favro API.
     * See {@link https://favro.com/developer/#tag} */
    export interface Data {
      tagId: string;
      organizationId: string;
      name: string;
      color: FieldTypes.Color;
    }
  }

  /**
   * Favro API Data models for Widgets (a.k.a. "Boards")
   */
  export namespace Widget {
    /**
     * Helper types for the values of {@link Widget.Data} fields.
     */
    export namespace FieldTypes {
      export type Color =
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

      export type Type = 'backlog' | 'board';
      export type Role = 'owners' | 'fullMembers' | 'guests';
    }

    /**
     * The data model for a Widget returned from the Favro API.
     */
    export interface Data {
      /** The shared id of the widget. */
      widgetCommonId: string;
      /** The id of the organization that this widget exists in. */
      organizationId: string;
      /** The ids of the collections that this widget exists in. This array will only contain collections that the user has access to. */
      collectionIds: string[];
      /** The name of the widget. */
      name: string;
      /** The type of the widget. */
      type: FieldTypes.Type;
      /** If set, this means that this widget is a breakdown of a card. */
      breakdownCardCommonId: string;
      /** The color of the widget icon. Refer to widget colors. */
      color: FieldTypes.Color;
      /** The users that have ownership of the widget. */
      ownerRole: FieldTypes.Role;
      /** The users that can add, edit and move cards on the widget. */
      editRole: FieldTypes.Role;
    }

    /**
     * The data model for the request body when creating a widget.
     *
     * See {@link https://favro.com/developer/#update-a-widget}
     */
    export type Create = { collectionId: string } & Partial<
      Pick<Data, 'name' | 'type' | 'color' | 'ownerRole' | 'editRole'>
    >;
  }

  /**
   * Favro API Data models for Columns
   */
  export namespace Column {
    /**
     * The data model for Columns returned from the Favro API.
     * {@link https://favro.com/developer/#column-object}
     */
    export interface Data {
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
  }
}
