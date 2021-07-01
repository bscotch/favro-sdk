import type { DataFavroWidget } from '$/types/FavroWidgetTypes.js';
import type { BravoWidget } from '@/BravoWidget.js';
import { BravoClient } from '@/BravoClient';
import { BravoEntity } from '@/BravoEntity';
import { FavroResponse } from './FavroResponse';

export type BravoResponseWidgets = BravoResponseEntities<
  DataFavroWidget,
  BravoWidget
>;

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

  constructor(
    private _client: BravoClient,
    private EntityClass: new (client: BravoClient, data: EntityData) => Entity,
    firstPage: FavroResponse<EntityData>,
  ) {
    this._latestPage = firstPage;
  }

  /**
   * A generator for iterating over the entities without having to
   * deal with paging. Will fetch next pages from the API while behind
   * the scenes until exhausted. Populates a cache in the process,
   * so that subsequent iteration will not require additional API calls.
   * @example
   * for await (let entity of this){}
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

  async findIndex(matchFunction: (entity: Entity, idx?: number) => any) {
    let idx = 0;
    for await (const entity of this) {
      if (await matchFunction(entity, idx)) {
        return idx;
      }
      idx++;
    }
    return -1;
  }

  async find(matchFunction: (entity: Entity, idx?: number) => any) {
    const idx = await this.findIndex(matchFunction);
    if (idx > -1) {
      // Will be cached if we found it, so can safely index the cache
      return this._entitiesCache[idx];
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
   * For paged responses, fetch, hydrate, and add the next page of
   * results to the cache. If there is not a next page, returns `undefined`.
   * If there is, returns *only* the hydrated entities for that page.
   * Useful for rate-limit-conscious searching.
   */
  private async fetchNextPage() {
    // Ensure the prior page got added!
    await this.ensureEntitiesAreHydrated();
    if (!this._latestPage || (await this._latestPage.isLastPage())) {
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
