import type { FavroApi } from '$types/FavroApi';
import { BravoEntity } from '$lib/BravoEntity.js';

/** Hydrated Favro Organization. */
export class BravoGroup extends BravoEntity<FavroApi.Group.Model> {
  get name() {
    return this._data.name;
  }

  get groupId() {
    return this._data.groupId;
  }

  get organizationId() {
    return this._data.organizationId;
  }

  get creatorUserId() {
    return this._data.creatorUserId;
  }

  get memberCount() {
    return this._data.memberCount;
  }

  get members() {
    return [...this._data.members];
  }

  equals(group: BravoGroup) {
    return (
      this.hasSameConstructor(group) &&
      this.organizationId === group.organizationId &&
      this.groupId === group.groupId
    );
  }
}
