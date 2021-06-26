import type { DataFavroOrganization } from '../types/FavroApiTypes';
import { FavroEntity } from './FavroEntity.js';
import { FavroOrganizationMember } from './FavroUser.js';

export class FavroOrganization extends FavroEntity<DataFavroOrganization> {
  get name() {
    return this._data.name;
  }

  get sharedToUsers() {
    return this._data.sharedToUsers.map(
      (u) => new FavroOrganizationMember(this._client, u),
    );
  }

  get organizationId() {
    return this._data.organizationId;
  }
}
