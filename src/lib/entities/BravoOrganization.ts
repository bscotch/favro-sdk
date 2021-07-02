import type { DataFavroOrganization } from '$types/FavroApiTypes';
import { BravoEntity } from '$lib/BravoEntity.js';
import { BravoOrganizationMember } from './users.js';

export class BravoOrganization extends BravoEntity<DataFavroOrganization> {
  get name() {
    return this._data.name;
  }

  get sharedToUsers() {
    return this._data.sharedToUsers.map(
      (u) => new BravoOrganizationMember(this._client, u),
    );
  }

  get organizationId() {
    return this._data.organizationId;
  }

  equals(org: BravoOrganization) {
    return (
      this.hasSameConstructor(org) && this.organizationId === org.organizationId
    );
  }
}
