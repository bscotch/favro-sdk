import {
  FavroDataOrganizationUser,
  FavroDataOrganizationUserPartial,
} from '../types/FavroApi';
import { FavroEntity } from './FavroEntity.js';

export class FavroUser<
  Data extends FavroDataOrganizationUser | FavroDataOrganizationUserPartial,
> extends FavroEntity<Data> {
  get userId() {
    return this._data.userId;
  }

  get role() {
    return 'organizationRole' in this._data
      ? this._data.organizationRole
      : this._data.role;
  }

  get name(): Data extends FavroDataOrganizationUser ? string : undefined {
    // @ts-expect-error
    return 'name' in this._data ? this._data.name : undefined;
  }

  get email(): Data extends FavroDataOrganizationUser ? string : undefined {
    // @ts-expect-error
    return 'email' in this._data ? this._data.email : undefined;
  }
}
