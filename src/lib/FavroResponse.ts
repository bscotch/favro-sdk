import { Response } from 'node-fetch';
import { FavroResponseData } from '../types/FavroApi';
import type { BravoClient } from './BravoClient.js';
import { FavroEntity } from './FavroEntity';

export class FavroResponse<EntityData, Entity extends FavroEntity<EntityData>> {
  private _response: Response;
  private _entities: Entity[];

  constructor(
    private _client: BravoClient,
    entityClass: new (client: BravoClient, data: EntityData) => Entity,
    response: Response,
    data: FavroResponseData<EntityData>,
  ) {
    this._response = response;
    const entitiesData = 'entities' in data ? data.entities : [data];
    this._entities = entitiesData.map((e) => new entityClass(_client, e));
    // Could be a PAGED response (with an entities field) or not!
    // Normalize to always have the data be an array
  }

  get status() {
    return this._response.status;
  }

  get succeeded() {
    return this.status <= 399 && this.status >= 200;
  }

  get failed() {
    return this.succeeded;
  }

  get requestsRemaining() {
    return Number(this._response.headers.get('X-RateLimit-Remaining'));
  }

  get limitResetsAt() {
    return new Date(this._response.headers.get('X-RateLimit-Reset')!);
  }

  get entities() {
    return [...this._entities];
  }
}
