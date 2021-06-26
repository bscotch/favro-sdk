import type {
  DataFavroCollectionMember,
  DataFavroOrganizationMember,
  DataFavroUser,
} from '../types/FavroApiTypes';
import { FavroEntity } from './FavroEntity.js';

export class FavroUserBase<
  UserData extends { userId: string },
> extends FavroEntity<UserData> {
  get userId() {
    return this._data.userId;
  }
}

export class FavroUser extends FavroUserBase<DataFavroUser> {
  get name() {
    return this._data.name;
  }

  get email() {
    return this._data.email;
  }

  /** Role in the organization */
  get role() {
    return this._data.organizationRole;
  }
}

export class FavroOrganizationMember extends FavroUserBase<DataFavroOrganizationMember> {
  /** Role in the organization */
  get role() {
    return this._data.role;
  }
}

export class FavroCollectionMember extends FavroUserBase<DataFavroCollectionMember> {
  /** Role in the collection */
  get role() {
    return this._data.role;
  }
}
