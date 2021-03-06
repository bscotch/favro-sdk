import type { BravoClient } from '$lib/BravoClient';
import type { BravoEntity } from '$lib/BravoEntity';
import type { FavroResponse } from './FavroResponse';
import type { BravoWidget } from '$entities/BravoWidget.js';
import type { BravoCustomFieldDefinition } from '../entities/BravoCustomField.js';
import type { FavroApi } from '$types/FavroApi.js';
import type { BravoTagDefinition } from '../entities/BravoTag.js';
import { Logger } from '../Logger.js';

export type BravoResponseWidgets = BravoResponseEntities<
  FavroApi.Widget.Model,
  BravoWidget
>;

export type BravoResponseCustomFields = BravoResponseEntities<
  FavroApi.CustomFieldDefinition.Model,
  BravoCustomFieldDefinition<any>
>;

export type BravoResponseTags = BravoResponseEntities<
  FavroApi.Tag.Model,
  BravoTagDefinition
>;

export type BravoResponseEntitiesMatchFunction<Entity> = (
  entity: Entity,
  idx?: number,
) => any | Promise<Entity>;

/**
 * Hydrated Favro response. Can iterate over instances
 * with `for async (const entity of this){}`
 */
export class BravoResponseEntities<
  EntityData,
  Entity extends BravoEntity<EntityData>,
> {
  private _entitiesCache: Entity[] = [];
  private _hydratedLatestPage = false;
  private _latestPage?: FavroResponse<EntityData>;
  /**
   * Entities to cache in a *map* while looping over entries,
   * but with multiple caches (one for each identifier field).
   */
  private _entitiesCachedById: {
    [identifierName: string]: { [identifierValue: string]: Entity };
  } = {};

  constructor(
    private _client: BravoClient,
    private EntityClass: new (client: BravoClient, data: EntityData) => Entity,
    firstPage: FavroResponse<EntityData>,
  ) {
    this._latestPage = firstPage;
  }

  /**
   * A generator for iterating over the entities without having to
   * deal with paging. Will fetch next pages from the API behind
   * the scenes until exhausted. Populates a cache in the process,
   * so that subsequent iteration will not require additional API calls.
   * @example
   * for await (let entity of this)\{\}
   */
  async *[Symbol.asyncIterator]() {
    // Ensure everything we've got so far is properly hydrated etc
    await this.ensureEntitiesAreHydrated();
    // Build out the cache in front of us by grabbing next pages
    // as needed.
    let entityIdx = 0;
    while (entityIdx < this._entitiesCache.length) {
      yield this._entitiesCache[entityIdx];
      entityIdx++;
      if (entityIdx === this._entitiesCache.length) {
        // Then we either need a next page, or we're done
        const nextPage = await this.fetchNextPage();
        if (!nextPage) {
          return;
        }
      }
    }
  }

  /**
   * Filter all entities by a match function. Note that this
   * requires exhaustively paging all entities, which can be
   * both slow and make a lot of API calls depending on the
   * source of these entities.
   */
  async filter(matchFunction: BravoResponseEntitiesMatchFunction<Entity>) {
    const matches: Entity[] = [];
    let idx = 0;
    for await (const entity of this) {
      if (await matchFunction(entity, idx)) {
        matches.push(entity);
      }
      idx++;
    }
    return matches;
  }

  async findIndex(matchFunction: BravoResponseEntitiesMatchFunction<Entity>) {
    let idx = 0;
    for await (const entity of this) {
      if (await matchFunction(entity, idx)) {
        return idx;
      }
      idx++;
    }
    return -1;
  }

  async find(matchFunction: BravoResponseEntitiesMatchFunction<Entity>) {
    const idx = await this.findIndex(matchFunction);
    if (idx > -1) {
      // Will be cached if we found it, so can safely index the cache
      return this._entitiesCache[idx];
    }
  }

  /**
   * Find an entity by an identifier field.
   */
  async findById(
    identifierName: string,
    identifierValue: string,
  ): Promise<Entity | undefined> {
    // Ensure we have the per-identifier name cache
    this._entitiesCachedById[identifierName] ||= {};
    const cache = this._entitiesCachedById[identifierName]!;
    if (cache[identifierValue]) {
      return cache[identifierValue];
    }

    // Need to iterate over the list! But we can cache as we go.
    for await (const entity of this) {
      // @ts-expect-error
      const entityIdValue = entity[identifierName];
      cache[entityIdValue] ||= entity;
      // @ts-expect-error
      if (entity[identifierName] === identifierValue) {
        return entity;
      }
    }
  }

  /**
   * Exhaustively fetch all entities (including those on
   * subsequent pages, requiring additional API calls),
   * hydrated as Bravo Entity instances. Results are cached.
   * **Note:** you can iterate over this object directly with
   * an async loop, which is more appropriate for searches
   * since you a match might be found prior to exhausting all
   * pages.
   */
  async getAllEntities() {
    const entities: Entity[] = [];
    for await (const entity of this) {
      entities.push(entity);
    }
    return entities;
  }

  /**
   * Some requests only return one item,
   * and there may be other reasons you just
   * want the first item obtained.
   */
  async getFirstEntity() {
    await this.ensureEntitiesAreHydrated();
    return this._entitiesCache[0];
  }

  /**
   * For paged responses, fetch, hydrate, and add the next page of
   * results to the cache. If there is not a next page, returns `undefined`.
   * If there is, returns *only* the hydrated entities for that page.
   * Useful for rate-limit-conscious searching.
   */
  private async fetchNextPage() {
    // Ensure the prior page got added!
    Logger.debug('bravo:paging:next')(`fetching`);
    await this.ensureEntitiesAreHydrated();
    if (!this._latestPage || (await this._latestPage.isLastPage())) {
      Logger.debug('bravo:paging:next')(`cancelled`);
      return;
    }
    this._latestPage = await this._latestPage.getNextPageResponse();
    this._hydratedLatestPage = false;
    const newPage = await this.ensureEntitiesAreHydrated();
    return newPage;
  }

  /**
   * Ensure hydration of the latest page of results and append
   * them to the cache. If the latest page is already hydrated, returns nothing.
   * Else returns a copy of *just that page* of hydrated entities.
   */
  private async ensureEntitiesAreHydrated() {
    if (!this._hydratedLatestPage && this._latestPage) {
      const newEntities = (await this._latestPage.getEntitiesData()).map(
        (e) => new this.EntityClass(this._client, e),
      );
      this._entitiesCache.push(...newEntities);
      this._hydratedLatestPage = true;
      return newEntities;
    }
  }
}
