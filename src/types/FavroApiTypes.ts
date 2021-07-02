import type { BravoClient } from '$lib/BravoClient.js';
import type { BravoEntity } from '$lib/BravoEntity.js';

export type OptionFavroHttpMethod = 'get' | 'post' | 'put' | 'delete';
export type OptionFavroCollectionColorBackground =
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
export type OptionFavroCollectionVisibility =
  | 'users'
  | 'organization'
  | 'public';
export type OptionFavroCollectionRole = 'guest' | 'view' | 'edit' | 'admin';

export type OptionFavroOrganizationRole =
  | 'administrator'
  | 'fullMember'
  | 'externalMember'
  | 'guest'
  | 'disabled';

export interface DataFavroOrganizationMember {
  userId: string;
  role: OptionFavroCollectionRole;
  joinDate: string;
}

export interface DataFavroCollectionMember {
  userId: string;
  role: OptionFavroCollectionRole;
}

/** {@link https://favro.com/developer/#collections} */
export interface DataFavroCollection {
  /** The id of the collection. */
  collectionId: string;
  /** The id of the organization that this collection exists in. */
  /** The name of the collection. */
  organizationId: string;
  name: string;
  /** The array of collection members that the collection is shared to. */
  sharedToUsers: DataFavroCollectionMember[];
  /** The collection public sharing level. */
  publicSharing: OptionFavroCollectionVisibility;
  /** The collection background. */
  background: OptionFavroCollectionColorBackground;
  /** Whether or not the collection is archived. */
  archived: boolean;
  /** Whether or not full members shared this collection can create new widgets. */
  fullMembersCanAddWidgets: boolean;
}

export interface DataFavroOrganization {
  organizationId: string;
  name: string;
  sharedToUsers: DataFavroOrganizationMember[];
}

export interface DataFavroUser {
  userId: string;
  name: string;
  email: string;
  organizationRole: OptionFavroOrganizationRole;
}
export type DataAnyEntity = Record<string, any>;

export interface DataFavroResponsePaged<DataEntity extends DataAnyEntity> {
  limit: number;
  page: number;
  pages: number;
  requestId: string;
  entities: DataEntity[];
}
export type DataFavroResponse<EntityData extends DataAnyEntity> =
  | DataFavroResponsePaged<EntityData>
  | EntityData;

export type ConstructorFavroEntity<EntityData extends DataAnyEntity> = new (
  client: BravoClient,
  data: EntityData,
) => BravoEntity<EntityData>;
