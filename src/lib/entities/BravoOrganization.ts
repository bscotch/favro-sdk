import type { FavroApi } from '$types/FavroApi';
import { BravoEntity } from '$lib/BravoEntity.js';

/** Hydrated Favro Organization. */
export class BravoOrganization extends BravoEntity<FavroApi.Organization.Data> {
  get name() {
    return this._data.name;
  }

  get sharedToUsers() {
    return [...this._data.sharedToUsers];
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
