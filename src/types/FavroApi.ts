import type { BravoClient } from '@/BravoClient.js';
import type { FavroEntity } from '@/FavroEntity.js';

export type FavroApiMethod = 'get' | 'post' | 'put' | 'delete';
export type FavroRole =
  | 'administrator'
  | 'fullMember'
  | 'externalMember'
  | 'guest'
  | 'disabled';
export type FavroCollectionBackground =
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

/** {@link https://favro.com/developer/#collections} */
export interface FavroDataCollection {
  /** The id of the collection. */
  collectionId: string;
  /** The id of the organization that this collection exists in. */
  /** The name of the collection. */
  organizationId: string;
  name: string;
  /** The array of collection members that the collection is shared to. */
  sharedToUsers: FavroDataOrganizationUserPartial[];
  /** The collection public sharing level. */
  publicSharing: string;
  /** The collection background. */
  background: FavroCollectionBackground;
  /** Whether or not the collection is archived. */
  archived: boolean;
  /** Whether or not full members shared this collection can create new widgets. */
  fullMembersCanAddWidgets: boolean;
}

export interface FavroDataOrganization {
  organizationId: string;
  name: string;
  sharedToUsers: {
    userId: string;
    role: FavroRole;
  }[];
}

export type FavroDataOrganizationUserPartial =
  FavroDataOrganization['sharedToUsers'][number];

export interface FavroDataOrganizationUser {
  userId: string;
  name: string;
  email: string;
  organizationRole: FavroRole;
}
export type AnyEntityData = Record<string, any>;

interface FavroResponsePaged<EntityData extends AnyEntityData> {
  limit: number;
  page: number;
  pages: number;
  requestId: string;
  entities: EntityData[];
}
export type FavroResponseData<EntityData extends AnyEntityData> =
  | FavroResponsePaged<EntityData>
  | EntityData;

export type FavroEntityConstructor<EntityData> = new (
  client: BravoClient,
  data: EntityData,
) => FavroEntity<EntityData>;
