import type { FavroApi } from '$types/FavroApi';
import { BravoEntity } from '$lib/BravoEntity.js';

/**
 * Base User class, reflecting the bare minimum info returned
 * by various endpoints (just a UserId).
 */
class BravoUserBase<
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

/**
 * A hydrated User entity, as returned from the Users API
 * endpoint.
 */
export class BravoUser extends BravoUserBase<FavroApi.User.Model> {
  get name() {
    return this._data.name;
  }

  get email() {
    return this._data.email;
  }

  /** Role in the organization */
  get organizationRole() {
    return this._data.organizationRole;
  }
}
