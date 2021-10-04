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

  /**
   * Convenience function for the BravoClient's `updateGroup` method.
   * Updates the data *for this BravoGroup instance* and returns itself,
   * unlike the client method which returns a new instance.
   */
  async update(options: FavroApi.Group.UpdateBody) {
    const updated = await this._client.updateGroupById(this.groupId, options);
    this._data = updated.toJSON();
    return this;
  }

  async delete() {
    return this._client.deleteGroupById(this.groupId);
  }

  equals(group: BravoGroup) {
    return (
      this.hasSameConstructor(group) &&
      this.organizationId === group.organizationId &&
      this.groupId === group.groupId
    );
  }
}
