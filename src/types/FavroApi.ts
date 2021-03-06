import type { KeyXOR } from './Utility.js';

/**
 * Typings for the data models used by the Favro API, as
 * a collection of namespaces per general data type (e.g. Widget, Card)
 * containing interfaces and types for each data model.
 *
 * 📄 https://favro.com/developer
 *
 * @public
 */
export namespace FavroApi {
  /**
   * Custom fields come in a bunch of different high-level types,
   * with a lot of overlap in data models but some differences.
   *
   * @remarks
   * These type values are seen in many API contexts; aliases
   * are added to those namepspaces to this type.
   *
   */
  export type CustomFieldType =
    | 'Checkbox'
    | 'Date'
    | 'Link'
    | 'Members'
    | 'Multiple select'
    | 'Number'
    | 'Rating'
    | 'Single select'
    | 'Tags'
    | 'Text'
    | 'Time'
    | 'Timeline'
    | 'Voting';

  /**
   * The standardized pageable format returned by much of the
   * Favro API
   *
   * 📄 https://favro.com/developer/#pagination
   *
   * @typeParam DataEntity - The shape of the data structure specific to
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
    | EntityData[]
    | EntityData;

  /**
   * A Favro "Organization" represents the functional unit by which
   * users and projects are organized. It's the top level of access.
   * A user's API token can be used on any of their organizations.
   */
  export namespace Organization {
    /**
     * Helper types for the values of {@link FavroApi.Organization.Model} fields.
     */
    export namespace ModelFieldValue {
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
    export interface Model {
      organizationId: string;
      name: string;
      sharedToUsers: ModelFieldValue.Member[];
    }
  }

  export namespace Group {
    /**
     * The data model returned by the Favro API for Groups.
     */
    export interface Model {
      groupId: string;
      organizationId: string;
      name: string;
      creatorUserId: string;
      memberCount: number;
      members: { userId: string; role: FavroApi.Group.ModelFieldValue.Role }[];
    }

    /**
     * [📄 See the docs.](https://favro.com/developer/#update-a-group)
     */
    export interface UpdateBody {
      name?: string;
      members?: (KeyXOR<{ userId: string }, { email: string }> &
        KeyXOR<
          { delete: boolean },
          { role: FavroApi.Group.ModelFieldValue.Role }
        >)[];
    }

    export namespace ModelFieldValue {
      export type Role = 'administrator' | 'member';
    }
  }

  /** Favro API Model model for Collections. */
  export namespace Collection {
    /**
     * Helper types for the values of {@link FavroApi.Collection.Model} fields.
     */
    export namespace ModelFieldValue {
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

    /**
     * 📄 https://favro.com/developer/#collections
     */
    export interface Model {
      /** The id of the collection. */
      collectionId: string;
      /** The id of the organization that this collection exists in. */
      organizationId: string;
      /** The name of the collection. */
      name: string;
      /** The array of collection members that the collection is shared to. */
      sharedToUsers: ModelFieldValue.Member[];
      /** The collection public sharing level. */
      publicSharing: ModelFieldValue.Visibility;
      /** The collection background. */
      background: ModelFieldValue.ColorBackground;
      /** Whether or not the collection is archived. */
      archived: boolean;
      /** Whether or not full members shared this collection can create new widgets. */
      fullMembersCanAddWidgets: boolean;
    }
  }

  /** Favro API Model models for Users */
  export namespace User {
    /**
     * Helper types for the values of {@link FavroApi.User.Model}
     */
    export namespace ModelFieldValue {}
    export interface Model {
      userId: string;
      name: string;
      email: string;
      organizationRole: Organization.ModelFieldValue.Role;
    }
  }

  /**
   * Favro tags are global to an organization.
   */
  export namespace Tag {
    export namespace ModelFieldValue {
      /**
       * 📄 https://favro.com/developer/#tag-colors */
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
     *
     * 📄 https://favro.com/developer/#tag */
    export interface Model {
      tagId: string;
      organizationId: string;
      name: string;
      color: ModelFieldValue.Color;
    }
  }

  /**
   * Favro API Model models for Widgets (a.k.a. "Boards")
   */
  export namespace Widget {
    /**
     * Helper types for the values of {@link FavroApi.Widget.Model} fields.
     */
    export namespace ModelFieldValue {
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
    export interface Model {
      /** The shared id of the widget. */
      widgetCommonId: string;
      /** The id of the organization that this widget exists in. */
      organizationId: string;
      /** The ids of the collections that this widget exists in. This array will only contain collections that the user has access to. */
      collectionIds: string[];
      /** The name of the widget. */
      name: string;
      /** The type of the widget. */
      type: ModelFieldValue.Type;
      /** If set, this means that this widget is a breakdown of a card. */
      breakdownCardCommonId: string;
      /** The color of the widget icon. Refer to widget colors. */
      color: ModelFieldValue.Color;
      /** The users that have ownership of the widget. */
      ownerRole: ModelFieldValue.Role;
      /** The users that can add, edit and move cards on the widget. */
      editRole: ModelFieldValue.Role;
    }

    /**
     * The data model for the request body when creating a widget.
     *
     * 📄 https://favro.com/developer/#update-a-widget
     */
    export type Create = { collectionId: string } & Partial<
      Pick<Model, 'name' | 'type' | 'color' | 'ownerRole' | 'editRole'>
    >;
  }

  /**
   * Favro API Model models for Columns
   */
  export namespace Column {
    /**
     * The data model for Columns returned from the Favro API.
     *
     * 📄 https://favro.com/developer/#column-object
     */
    export interface Model {
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

  /**
   * Favro API Model models for Custom Field Definitions.
   * See {@link FavroApi.CustomFieldValue} for how values are set
   * on Cards.
   *
   * 📄 https://favro.com/developer/#custom-field-types
   */
  export namespace CustomFieldDefinition {
    /**
     * Alias for {@link FavroApi.CustomFieldType}
     */
    export type Type = CustomFieldType;

    /**
     * Helper types for the values of {@link FavroApi.CustomFieldDefinition.Model} fields.
     *
     * 📄 https://favro.com/developer/#custom-field-types
     */
    export namespace ModelFieldValue {
      /**
       * Alias for {@link FavroApi.CustomFieldType}
       */
      export type FieldType = Type;

      /**
       * For 'Single select' and 'Multiple select' fields,
       * options are stored in the Custom Field definition
       */
      export interface SelectOption {
        /** The id of the custom field item. */
        customFieldItemId: string;
        /** The name of the custom field item. */
        name: string;
      }
    }

    /**
     * The Favro API data model for a Custom Field
     *
     * 📄 https://favro.com/developer/#custom-field
     */
    export interface Model<
      FieldType extends CustomFieldDefinition.ModelFieldValue.FieldType = any,
    > {
      /** The id of the organization that this custom field exists in. */
      organizationId: string;
      /** The id of the custom field. */
      customFieldId: string;
      /** Custom field type. */
      type: FieldType;
      /** The name of the custom field. */
      name: string;
      /** True if the custom field is currently enabled for the organization. */
      enabled: boolean;
      /** The list of items that this custom field can have in case it is a selectable one. */
      customFieldItems: FieldType extends Extract<
        CustomFieldType,
        'Single select' | 'Multiple select'
      >
        ? ModelFieldValue.SelectOption[]
        : undefined;
    }
  }

  /**
   * Favro API Model models for Custom Field Values,
   * when they are set on a {@link FavroApi.Card}. For the *definitions*
   * of Custom Fields, see {@link FavroApi.CustomFieldDefinition}.
   *
   * 📄 https://favro.com/developer/#card-custom-fields
   */
  export namespace CustomFieldValue {
    /**
     * Alias for {@link FavroApi.CustomFieldType}
     */
    export type Type = CustomFieldType;

    /**
     * Helper types for the values of {@link FavroApi.CustomFieldValue.Model}
     * fields.
     * 📄 https://favro.com/developer/#card-custom-fields
     */
    export namespace ModelFieldValue {
      export type Rating = 0 | 1 | 2 | 3 | 4 | 5;
    }

    /**
     * Data models for Custom Field Values returned from the Favro API,
     * based on the {@link FavroApi.CustomFieldType} of that field.
     */
    export interface Models {
      Number: {
        customFieldId: string;
        /** The total value of the field. */
        total: number;
      };
      Time: {
        customFieldId: string;
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
      };
      Text: {
        customFieldId: string;
        /** The value of the field. */
        value: string;
      };
      Rating: {
        customFieldId: string;
        /** The value of the field. Valid value is integer from 0 to 5. */
        total: ModelFieldValue.Rating;
      };
      Voting: {
        customFieldId: string;
        /** The id array of users that vote for the field. */
        value: string[];
      };
      Checkbox: {
        customFieldId: string;
        /** The value of the field. */
        value: boolean;
      };
      Date: {
        customFieldId: string;
        /** The date value in ISO format. */
        value: string;
      };
      Timeline: {
        customFieldId: string;
        /** The value options of the field. See custom field timeline. */
        timeline: {
          /** The value of start date in ISO format. Required. */
          startDate: string;
          /** The value of due date in ISO format. Required. */
          dueDate: string;
          /** The value to determine display text of field should include time or not. */
          showTime: boolean;
        };
      };
      Link: {
        customFieldId: string;
        /** The value options of the field. See custom field link. */
        link: {
          /** The url of the field. Required. */
          url: string;
          /** The display text of the field.*/
          text: string;
        };
      };
      Members: {
        customFieldId: string;
        /** The id array of users that are assigned to card. */
        value: string[];
      };
      Tags: {
        customFieldId: string;
        /** The id array of tags that are added to card. */
        value: string[];
      };
      'Single select': {
        customFieldId: string;
        /** The id array of item that are added to card. */
        value: string[];
      };
      'Multiple select': {
        customFieldId: string;
        /** The id array of item that are added to card. */
        value: string[];
      };
    }

    /**
     * The Favro API data model for a specific Custom Field Value,
     * based on its type.
     *
     * @example
     * // Create an alias for a specific type of Custom Field Value
     * type CustomFieldValueSingleSelect =
     *   FavroApi.CustomFieldValue.Model\<'Single select'\>;
     *
     * // Or keep things generic for narrowing later
     * function somethingGeneric\<
     *  Type extends FavroApi.CustomFieldValue.Type
     * \>(customFieldValue: FavorApi.CustomFieldValue.Model\<Type\>) \{
     *  // ... do stuff
     * \}
     */
    export type Model<FieldType extends CustomFieldType = CustomFieldType> =
      Models[FieldType];

    export type UpdateBody<
      FieldType extends CustomFieldType = CustomFieldType,
    > = UpdateBodies[FieldType];

    /**
     * Data structures used to update Custom Field values on cards.
     * These are not used by themselves; they are sent as an array
     * of such structures when updating a card ({@link FavroApi.Card.UpdateBody }),
     * via the `customFields` field.
     *
     * 📄 https://favro.com/developer/#card-custom-field-parameters
     */
    export interface UpdateBodies
      extends Omit<
        FavroApi.CustomFieldValue.Models,
        'Members' | 'Voting' | 'Time' | 'Tags'
      > {
      Members: {
        customFieldId: string;
        members: {
          /** The list of members, that will be added to the card custom field (array of userIds).*/
          addUserIds: string[];
          /** The list of members, that will be removed from card custom field (array of userIds).*/
          removeUserIds: string[];
          /** The list of card assignment, that will update their statuses on the custom field accordingly.*/
          completeUsers: { userId: string; completed: boolean }[];
        };
      };
      Tags: {
        customFieldId: string;
        tags: {
          /** The list of tag names or card tags that will be added to this card custom field. If the tag does not exist in the organization it will be created.*/
          addTags: string[];
          /** A list of tagIds that will be added to this card custom field.*/
          addTagIds: string[];
          /** The list of tag names, that will be removed from this card custom field.*/
          removeTags: string[];
          /** The list of tag IDs, that will be removed from this card custom field.*/
          removeTagIds: string[];
        };
      };
      Voting: {
        customFieldId: string;
        /**
         * The value to determine the field should be either voted or unvoted.
         */
        value: boolean;
      };
      /**
       * Not yet implemented.
       *
       * @alpha */
      Time: {
        customFieldId: string;
      };
    }
  }

  /**
   * Attachments are uploaded files stored on Cards and Comments.
   *
   * 📄 https://favro.com/developer/#attachments
   */
  export namespace Attachment {
    export interface Model {
      /** The name of the file. */
      name: string;
      /** The URL of the file. */
      fileURL: string;
      /** Optional thumbnail URL of the file. */
      thumbnailURL: string;
    }
  }

  /**
   * Cards are the the unit of getting work done. The
   * data returned from the Favro API consists of
   * Widget-specific Card "instances", with some
   * Card-global common properties, some common but Widget-specific
   * properties, and Card-global Custom Field values
   * ({@link FavroApi.CustomFieldValue}).
   *
   * 📄 https://favro.com/developer/#card
   */
  export namespace Card {
    /**
     * Helper types for the values of {@link FavroApi.Card.Model} fields.
     */
    export namespace ModelFieldValue {
      /** 📄 https://favro.com/developer/#card-assignment */
      export interface Assignment {
        userId: string;
        completed: boolean;
        isGroup?: boolean;
      }
      /** 📄 https://favro.com/developer/#card-time-on-board */
      export interface TimeOnBoard {
        /**
         * @remarks documentation does not include units
         */
        time: number;
        isStopped: boolean;
      }

      /** 📄 https://favro.com/developer/#card-favro-attachment */
      export interface FavroAttachment {
        /**
         * The cardCommonId of card or widgetCommonId of widget that
         * is linked to the card. */
        itemCommonId: string;
        type: 'card' | FavroApi.Widget.ModelFieldValue.Type;
      }
    }

    /**
     * The data model for a Card returned from the Favro API.
     *
     * 📄 https://favro.com/developer/#card
     */
    export interface Model {
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
      assignments: ModelFieldValue.Assignment[];
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
      attachments: Attachment.Model[];
      /**
       * The custom fields that are set on the card and enabled in
       * the organization. */
      customFields: CustomFieldValue.Model[];
      /**
       * The amount of time card has been on current board. */
      timeOnBoard: ModelFieldValue.TimeOnBoard;
      /**
       * The detailed summary of time card has been on each column of
       * the current board. The object key represents the columnId of
       * the column, and the value is the amount of time card has
       * been on that column. */
      timeOnColumns: { [columnId: string]: number };
      /** The Favro attachments on the card. See card favro attachment. */
      favroAttachments: ModelFieldValue.FavroAttachment[];
    }

    /**
     * Body parameters for API requests to create a Card.
     *
     * 📄 https://favro.com/developer/#create-a-card
     */
    export interface CreateBody
      extends Partial<Omit<Model, 'cardId' | 'organizationId'>> {
      name: string;
      /**
       * Require posting a card to a Widget (the API allows *not* doing
       * that, but that seems like it would create more trouble than it's worth) */
      widgetCommonId: string;
      descriptionFormat?: 'plaintext' | 'markdown';
    }

    /**
     * Query parameters for API requests to list Cards.
     * At least one of `cardCommonId`, `collectionId`,
     * `widgetCommonId`, `cardSequentialId` must be specified.
     *
     * 📄 https://favro.com/developer/#get-all-cards
     *
     * @remarks The `todoList` option is not provided since Bravo does
     * not meaningfully support it.
     */
    export interface SearchQuery {
      cardCommonId?: string;
      widgetCommonId?: string;
      collectionId?: string;
      cardSequentialId?: string | number;

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
      descriptionFormat?: 'plaintext' | 'markdown';
    }

    /**
     * Body parameters for API requests to update a Card.
     * Note that `cardId` must be specified in the URL,
     * and `descriptionFormat` should be set to `'markdown'`
     * in the query params so that the returned result will
     * have a Markdown body.
     *
     * 📄 https://favro.com/developer/#update-a-card
     */
    export interface UpdateBody {
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
      /** The id of the parent card in the card hierarchy (sheet or card list), where the card will be commited. It must belong to the widget specified in the widgetCommonId parameter. */
      parentCardId?: string;
      /** The list of assignments, that will be added to card (array of userIds).*/
      addAssignmentIds?: string[];
      /** The list of assignments, that will be removed from card (array of userIds).*/
      removeAssignmentIds?: string[];
      /** The list of card assignment, that will update their statuses accordingly.*/
      completeAssignments?: { userId: string; completed: boolean }[];
      /** The list of tag names or card tags that will be added to the card. If the tag does not exist in the organization it will be created.*/
      addTags?: string[];
      /** A list of tagIds that will be added to card.*/
      addTagIds?: string[];
      /** The list of tag names, that will be removed from card.*/
      removeTags?: string[];
      /** The list of tag IDs, that will be removed from card.*/
      removeTagIds?: string[];
      /** The start date of card. Format ISO-8601. If null, start date will be removed.*/
      startDate?: string | null;
      /** The due date of card. Format ISO-8601. If null, due date will be removed.*/
      dueDate?: string | null;
      /** The list of card tasklists, that will be added to card.*/
      addTasklists?: {
        name: string;
        tasks: (string | { name: string; completed?: boolean })[];
      }[];
      /**
       * The list of card attachments URLs, that will be removed from the card.
       *
       * @remarks Unclear what URL is being referenced here. Best guess is the
       * `fileURL` field from an attachment object.
       */
      removeAttachments?: string[];
      /**
       * The list of card custom field parameters, that will be added or modified.
       *
       * @remarks Value objects are VERY similar to those that appear in the same
       * field upon fetching a Card, but there are some differences.
       */
      customFields?: CustomFieldValue.UpdateBody[];
      /** The list of card favro attachment that will be added to the card.*/
      addFavroAttachments?: FavroApi.Card.ModelFieldValue.FavroAttachment[];
      /**
       * The list of cardCommonId and widgetCommonId of card
       * favro attachment, that will be removed from the card.
       *
       * @remarks Presumably this is the `itemCommonId` field value
       */
      removeFavroAttachmentIds?: string[];
      /** Archive or unarchive card.*/
      archive?: boolean;
    }
  }

  /**
   * Outgoing Webhooks (those sent *from* Favro *to* external services)
   * are how you can capture events from within Favro and act on them.
   * Favro provides mechanisms for creating these in both the UI and API.
   * Note that Webhook events are *attached to columns*, not boards nor
   * the entire organization.
   *
   * 📄 https://favro.com/developer/#outgoing-webhooks
   */
  export namespace WebhookDefinition {
    /**
     * Helper types for the values of {@link FavroApi.WebhookDefinition.Model} fields.
     */
    export namespace ModelFieldValue {
      /**
       * 📄 https://favro.com/developer/#webhook-options
       */
      export interface Options {
        /** The array of columnIds for which webhook notifications will be sent. */
        columnIds: string[];
        /** The webhook notifications to include. If empty, all notifications will be sent. Refer to webhook notifications. */
        notifications: EventName[];
      }

      /**
       * The names of the events that a Webhook can trigger on.
       *
       * 📄 https://favro.com/developer/#webhook-notifications
       */
      export type EventName =
        | 'Card created'
        | 'Card committed'
        | 'Card moved'
        | 'Card updated'
        | 'Card removed'
        | 'Comment added'
        | 'Comment changed'
        | 'Comment removed';
    }

    /**
     * The Favro API data structure representing a Webhook definition,
     * (returned from the API when managing webhooks).
     */
    export interface Model {
      /** The id of the webhook. */
      webhookId: string;
      /** The common id of the widget that this webhook was created for. */
      widgetCommonId: string;
      /** The name of the webhook. */
      name: string;
      /** The address to post webhook notifications to. */
      postToUrl: string;
      /** The secret used to sign the HTTP header X-Favro-Webhook. See webhook signatures for more information. */
      secret: string;
      /** The options for this webhook. Refer to webhook options. */
      options: FavroApi.WebhookDefinition.ModelFieldValue.Options;
    }

    /**
     * 📄 https://favro.com/developer/#create-a-webhook
     */
    export type CreateBody = Omit<
      FavroApi.WebhookDefinition.Model,
      'webhookId'
    >;

    /**
     * Sent to {@link FavroApi.WebhookDefinition.CreateBody.postToUrl} when
     * a webhook is created. Must return a 200 in response.
     *
     * 📄 https://favro.com/developer/#ping-event
     */
    export interface CreatePing {
      /** The new unique identifier for the created webhook */
      hookId: string;
      /** The webhook definition that was created */
      hook: FavroApi.WebhookDefinition.Model;
    }
  }

  /**
   * Comments live on Cards, but are managed independently from
   * Cards via the Favro API.
   *
   * 📄 https://favro.com/developer/#comments
   */
  export namespace Comment {
    export interface Model {
      /** The id of the comment. */
      commentId: string;
      /** The id of the organization that this comment exists in. */
      organizationId: string;
      /** The common id of the card that this comment exists on. */
      cardCommonId: string;
      /** The text of the comment. */
      comment: string;
      /** The id of the user that posted the comment. */
      userId: string;
      /** The date that the comment was posted. */
      created: Date;
      /** The date that the comment was last edited. Only set if the comment has been edited. */
      lastUpdated: Date;
      /** The file attachments on the comment. See attachments. */
      attachments: Attachment.Model[];
    }

    export interface CreateBody {
      /** The common id of the card to post the comment on. Required. */
      cardCommonId: string;
      /** The body of the comment. Required. */
      comment: string;
    }
  }

  /**
   * When a registered Webhook triggers,
   * a payload is sent to the Webhook's address
   * ({@link FavroApi.WebhookDefinition.Model.postToUrl}).
   * The server at that URL must return a 200 in response.
   *
   * 📄 https://favro.com/developer/#webhook-responses
   */
  export namespace WebhookEvent {
    /**
     * Helper types for the values of {@link FavroApi.WebhookEvent.Model} fields.
     */
    export namespace ModelFieldValue {
      export interface CardEventNamesAndActions {
        'Card created': 'created';
        'Card committed': 'committed';
        'Card moved': 'moved';
        'Card updated': 'updated';
        'Card removed': 'deleted';
      }

      export interface CommentEventNamesAndActions {
        'Comment added': 'created';
        'Comment changed': 'updated';
        'Comment removed': 'deleted';
      }

      export type CardEventName = keyof CardEventNamesAndActions;
      export type CardEventAction = CardEventNamesAndActions[CardEventName];
      export type CommentEventName = keyof CommentEventNamesAndActions;
      export type CommentEventAction =
        CommentEventNamesAndActions[CommentEventName];

      /**
       * Mapping of the Event names to their corresponding
       * `action` field values in payload models.
       */
      export type EventNamesAndActions = CardEventNamesAndActions &
        CommentEventNamesAndActions;

      /**
       * All Webhook Event payloads include these common fields.
       */
      export interface EventModelBase {
        payloadId: string;
        action: EventNamesAndActions[keyof EventNamesAndActions];
        card: FavroApi.Card.Model;
        sender: FavroApi.User.Model;
      }

      /**
       * All payloads for Card events include these fields.
       */
      export interface CardEventModelBase extends EventModelBase {
        widget: FavroApi.Widget.Model;
      }
    }

    /**
     * The Favro API data structure sent to the Webhook's address
     * upon Comment-related event.
     *
     * 📄 https://favro.com/developer/#comment-created-event
     */
    export interface CommentEventModel<
      EventName extends ModelFieldValue.CommentEventName = any,
    > extends ModelFieldValue.EventModelBase {
      action: ModelFieldValue.CommentEventNamesAndActions[EventName];
      comment: FavroApi.Comment.Model;
    }

    export interface CardEventModels {
      'Card created': ModelFieldValue.CardEventModelBase & {
        action: 'created';
        column: FavroApi.Column.Model;
      };
      'Card committed': ModelFieldValue.CardEventModelBase & {
        action: 'committed';
        column: FavroApi.Column.Model;
        sourceWidget: FavroApi.Widget.Model;
      };
      'Card moved': ModelFieldValue.CardEventModelBase & {
        action: 'moved';
        column: FavroApi.Column.Model;
        sourceColumn: FavroApi.Column.Model;
      };
      'Card updated': ModelFieldValue.CardEventModelBase & {
        action: 'updated';
      };
      'Card removed': ModelFieldValue.CardEventModelBase & {
        action: 'deleted';
      };
    }

    export type CardEventModel<EventName extends keyof CardEventModels> =
      CardEventModels[EventName];
  }
}
