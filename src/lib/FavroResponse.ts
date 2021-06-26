import { Response } from 'node-fetch';
import { DataFavroResponse } from '../types/FavroApi';
import type { BravoClient } from './BravoClient.js';
import { FavroEntity } from './FavroEntity';

export class FavroResponse {
  constructor(protected _response: Response) {}

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
}

export class FavroResponseEntities<
  EntityData,
  Entity extends FavroEntity<EntityData>,
> extends FavroResponse {
  private _entities: Entity[];

  constructor(
    data: DataFavroResponse<EntityData>,
    entityClass: new (client: BravoClient, data: EntityData) => Entity,
    protected _client: BravoClient,
    ...args: ConstructorParameters<typeof FavroResponse>
  ) {
    super(...args);
    const entitiesData = 'entities' in data ? data.entities : [data];
    this._entities = entitiesData.map((e) => new entityClass(this._client, e));
    // Could be a PAGED response (with an entities field) or not!
    // Normalize to always have the data be an array
  }

  get entities() {
    return [...this._entities];
  }
}
