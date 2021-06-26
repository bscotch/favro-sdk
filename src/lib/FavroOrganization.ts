import type { FavroDataOrganization } from '../types/FavroApi';
import { FavroEntity } from './FavroEntity.js';
import { FavroUser } from './FavroUser.js';

export class FavroOrganization extends FavroEntity<FavroDataOrganization> {
  get name() {
    return this._data.name;
  }

  get sharedToUsers() {
    return this._data.sharedToUsers.map((u) => new FavroUser(this._client, u));
  }

  get organizationId() {
    return this._data.organizationId;
  }
}
