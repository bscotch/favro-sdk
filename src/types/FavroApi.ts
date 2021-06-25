export type FavroApiMethod = 'get' | 'post' | 'put' | 'delete';
type FavroRole =
  | 'administrator'
  | 'fullMember'
  | 'externalMember'
  | 'guest'
  | 'disabled';

export interface FavroDataOrganization {
  organizationId: string;
  name: string;
  sharedToUsers: {
    userId: string;
    role: FavroRole;
    joinDate: string;
  }[];
}

export interface FavroDataOrganizationUser {
  userId: string;
  name: string;
  email: string;
  organizationRole: FavroRole;
}
export type AnyEntity = Record<string, any>;
interface FavroResponsePaged<Entity extends AnyEntity = AnyEntity> {
  limit: number;
  page: number;
  pages: number;
  requestId: string;
  entities: Entity[];
}
export type FavroResponseData<Entity extends AnyEntity = AnyEntity> =
  | FavroResponsePaged<Entity>
  | Entity;
