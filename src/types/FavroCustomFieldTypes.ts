/**
 * @note
 * The documentation for the custom fields is a bit
 * unclear. The types below match the docs, but should be
 * checked for validity against real returned data. In
 * particular, some types refer to a "custom" object for
 * that same type -- it's unclear under what circumstances
 * the parent vs child objects are returned by the Favro API.
 *
 * {@link https://favro.com/developer/#custom-field-types}
 */

export type DataFavroCardField =
  | DataFavroCardFieldNumber
  | DataFavroCardFieldTime
  | DataFavroCardFieldText
  | DataFavroCardFieldRating
  | DataFavroCardFieldVote
  | DataFavroCardFieldCheckbox
  | DataFavroCardFieldDate
  | DataFavroCardFieldTimeline
  | DataFavroCardFieldLink
  | DataFavroCardFieldMembers
  | DataFavroCardFieldTags
  | DataFavroCardFieldStatus
  | DataFavroCardFieldMultipleSelect;

export interface DataFavroCardFieldNumber {
  /** The total value of the field. */
  total: number;
}
export interface DataFavroCardFieldTime {
  /** The total value of all time reported by all users. */
  total: number;
  /**
   * The values reported by each user.
   * The object key represents the userId of the user.
   * The value is an array of user entries. Refer to custom field time user reports. */
  reports: { [userId: string]: DataFavroCustomFieldTimeUserReports };
}
export interface DataFavroCardFieldText {
  /** The value of the field. */
  value: string;
}
export interface DataFavroCardFieldRating {
  /** The value of the field. Valid value is integer from 0 to 5. */
  total: 0 | 1 | 2 | 3 | 4 | 5;
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
  timeline: DataFavroCustomFieldTimeline;
}
export interface DataFavroCardFieldLink {
  /** The value options of the field. See custom field link. */
  link: DataFavroCustomFieldLink;
}
export interface DataFavroCardFieldMembers {
  /** The id array of users that are assigned to card. */
  value: string[];
}
export interface DataFavroCardFieldTags {
  /** The id array of tags that are added to card. */
  value: string[];
}
export interface DataFavroCardFieldStatus {
  /** The id array of item that are added to card. */
  value: string[];
}
export interface DataFavroCardFieldMultipleSelect {
  /** The id array of item that are added to card. */
  value: string[];
}
export interface DataFavroCustomFieldTimeUserReports {
  /** The id of the user entry. */
  reportId: string;
  /** The user entry value. Passing 0 will remove report entry. For custom fields with type "Time", this value is in milliseconds. */
  value: number;
  /** The description of the time report entry. */
  description: string;
  /** The report date in ISO format. */
  createdAt: string;
}
export interface DataFavroCustomFieldTimeline {
  /** The value of start date in ISO format. Required. */
  startDate: string;
  /** The value of due date in ISO format. Required. */
  dueDate: string;
  /** The value to determine display text of field should include time or not. */
  showTime: boolean;
}
export interface DataFavroCustomFieldLink {
  /** The url of the field. Required. */
  url: string;
  /** The display text of the field. Optional. */
  text: string;
}
export interface DataFavroCustomFieldMembers {
  /** The list of members, that will be added to the card custom field (array of userIds). Optional. */
  addUserIds: string[];
  /** The list of members, that will be removed from card custom field (array of userIds). Optional. */
  removeUserIds: string[];
  /** The list of card assignment, that will update their statuses on the custom field accordingly. Optional. */
  completeUsers: string[];
}
export interface DataFavroCustomFieldTags {
  /** The list of tag names or card tags that will be added to this card custom field. If the tag does not exist in the organization it will be created. Optional. */
  addTags: string[];
  /** A list of tagIds that will be added to this card custom field. Optional. */
  addTagIds: string[];
  /** The list of tag names, that will be removed from this card custom field. Optional. */
  removeTags: string[];
  /** The list of tag IDs, that will be removed from this card custom field. Optional. */
  removeTagIds: string[];
}
