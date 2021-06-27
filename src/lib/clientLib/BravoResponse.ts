import { BravoClient } from '../BravoClient';
import { FavroEntity } from '../FavroEntity';
import { FavroResponse } from './FavroResponse';

/**
 * Pager for hydrated Favro API responses
 */
export class BravoResponse<EntityData, Entity extends FavroEntity<EntityData>> {
  private _entities: Entity[] = [];
  private _hydratedLatestPage = false;

  constructor(
    private _client: BravoClient,
    private EntityClass: new (client: BravoClient, data: EntityData) => Entity,
    private _latestPage?: FavroResponse<EntityData>,
  ) {}

  /**
   * For paged responses, fetch, hydrate, and add the next page of
   * results to the cache. If there is not a next page, returns `undefined`.
   * If there is, returns *only* the hydrated entities for that page.
   * Useful for rate-limit-conscious searching.
   */
  async fetchNextPage() {
    // Ensure the prior page got added!
    await this.addLatestPageToCache();
    if (!this._latestPage || (await this._latestPage.isLastPage())) {
      return;
    }
    this._latestPage = await this._latestPage.getNextPageResponse();
    this._hydratedLatestPage = false;
    const newPage = await this.addLatestPageToCache();
    return newPage;
  }

  /**
   * Exhaustively page all results and return all entities.
   * Uses the cache.
   */
  async getAllEntities() {
    while (await this.fetchNextPage()) {}
    return this.getFetchedEntities();
  }

  /**
   * Get entities paged and fetched so far, hydrated as entity class instances (based
   * on what was provided to the constructor) */
  async getFetchedEntities() {
    // Ensure everything is hydrated
    await this.addLatestPageToCache();
    return [...this._entities];
  }

  /**
   * Ensure hydration of the latest page of results and append
   * them to the cache. If the latest page is already hydrated, returns nothing.
   * Else returns a copy of *just that page* of hydrated entities.
   */
  private async addLatestPageToCache() {
    if (!this._hydratedLatestPage && this._latestPage) {
      const newEntities = (await this._latestPage.getEntitiesData()).map(
        (e) => new this.EntityClass(this._client, e),
      );
      this._entities.push(...newEntities);
      this._hydratedLatestPage = true;
      return newEntities;
    }
  }
}
