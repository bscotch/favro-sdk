import type {
  DataFavroOrganization,
  DataFavroUser,
} from '$types/FavroApiTypes';
import { BravoEntity } from '$lib/BravoEntity.js';
import { BravoOrganizationMember, BravoUser } from './users.js';

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

  async listMembers() {
    return await this._client.listOrganizationMembers();
  }

  async findMember(match: (user: BravoUser) => any) {
    return await this._client.findOrganizationMember(match);
  }

  async findMemberByEmail(email: string | RegExp) {
    return await this._client.findOrganizationMemberByEmail(email);
  }

  async findMemberByName(name: string | RegExp) {
    return await this._client.findOrganizationMemberByName(name);
  }

  async findMemberByUserId(userId: string) {
    return await this._client.findOrganizationMemberByUserId(userId);
  }

  equals(org: BravoOrganization) {
    return (
      this.hasSameConstructor(org) && this.organizationId === org.organizationId
    );
  }
}
