import type { Response } from 'node-fetch';
import { URL } from 'url';
import type { FavroApi } from '$favro';
import { BravoError } from '../errors.js';
import type { FavroClient } from './FavroClient.js';

export class FavroResponse<
  DataEntity = null,
  Client extends FavroClient = FavroClient,
> {
  /**
   * Cached, parsed body if response was JSON.
   * If not defined, have not tried to obtain the body.
   * If null, have tried to obtain, but there wasn't one.
   */
  private _parsedBody?: null | undefined | FavroApi.Response<DataEntity>;

  constructor(protected _client: Client, protected _response: Response) {}

  get response() {
    return this._response;
  }

  get status() {
    return this._response.status;
  }

  get succeeded() {
    return this.status <= 399 && this.status >= 200;
  }

  get failed() {
    return !this.succeeded;
  }

  get requestsRemaining() {
    return Number(this._response.headers.get('X-RateLimit-Remaining'));
  }

  get limitResetsAt() {
    return new Date(this._response.headers.get('X-RateLimit-Reset')!);
  }

  get backendId() {
    return (
      this._response.headers.get('X-Favro-Backend-Identifier') || undefined
    );
  }

  async isLastPage() {
    const body = await this.getParsedBody();
    if (!body || !('page' in body) || body.page >= body.pages - 1) {
      return true;
    }
    return false;
  }

  async getNextPageResponse() {
    if (await this.isLastPage()) {
      return;
    }
    const body =
      (await this.getParsedBody()) as FavroApi.ResponsePaged<DataEntity>;
    const urlInst = new URL(this._response.url);
    urlInst.searchParams.set('requestId', body.requestId);
    urlInst.searchParams.set('page', `${body.page + 1}`);
    const res = await this._client.request<DataEntity>(urlInst.toString(), {
      backendId: this.backendId,
    });
    return res;
  }

  async getParsedBody() {
    if (typeof this._parsedBody != 'undefined') {
      return this._parsedBody;
    }
    const type = this._response.headers.get('Content-Type');
    if (!type?.startsWith('application/json')) {
      this._parsedBody = null;
      return this._parsedBody;
    }
    let responseBody: string | FavroApi.Response<DataEntity> = (
      await this._response.buffer()
    ).toString('utf8');
    try {
      responseBody = JSON.parse(responseBody) as FavroApi.Response<DataEntity>;
      this._parsedBody = responseBody;
      return this._parsedBody;
    } catch {
      throw new BravoError(`Could not JSON-parse: ${responseBody}`);
    }
  }

  async getEntitiesData() {
    const body = await this.getParsedBody();
    if (!body) {
      return [];
    }
    if ('entities' in body) {
      return [...body.entities];
    }
    return [body];
  }
}
