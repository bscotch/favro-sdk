import { Response } from 'node-fetch';
import { AnyEntity, FavroResponseData } from '../types/FavroApi';

export class FavroResponse<Entity extends AnyEntity = AnyEntity> {
  private _response: Response;
  private _entities: Entity[];

  constructor(response: Response, data: FavroResponseData<Entity>) {
    this._response = response;
    this._entities = 'entities' in data ? data.entities : [data];
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
