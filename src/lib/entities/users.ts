import type {
  DataFavroCollectionMember,
  DataFavroOrganizationMember,
  DataFavroUser,
} from '$types/FavroApiTypes';
import { BravoEntity } from '$lib/BravoEntity.js';

export class BravoUserBase<
  UserData extends { userId: string },
> extends BravoEntity<UserData> {
  get userId() {
    return this._data.userId;
  }
  equals<User extends BravoUserBase<any>>(otherUser: User) {
    return (
      this.hasSameConstructor(otherUser) && this.userId === otherUser.userId
    );
  }
}

export class BravoUser extends BravoUserBase<DataFavroUser> {
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

export class BravoOrganizationMember extends BravoUserBase<DataFavroOrganizationMember> {
  /** Role in the organization */
  get role() {
    return this._data.role;
  }
}

export class BravoCollectionMember extends BravoUserBase<DataFavroCollectionMember> {
  /** Role in the collection */
  get role() {
    return this._data.role;
  }
}
