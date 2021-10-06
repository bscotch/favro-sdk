import type { Response } from 'node-fetch';
import { URL } from 'url';
import type { FavroApi } from '$types/FavroApi.js';
import { BravoError } from '../errors.js';
import type { FavroClient } from './FavroClient.js';
import { stringToDate, stringToNumber } from '../utility.js';

function dataIsNull(data: any): data is null {
  return data === null;
}

function dataIsEntityArray<EntityArray extends Array<Record<string, any>>>(
  data: any,
): data is EntityArray {
  return !dataIsNull(data) && Array.isArray(data);
}

function dataIsPagedEntity<PagedEntity extends FavroApi.ResponsePaged<any>>(
  data: any,
): data is PagedEntity {
  return (
    !dataIsNull(data) &&
    !dataIsEntityArray(data) &&
    'page' in data &&
    'entities' in data
  );
}

export class FavroResponse<
  Data = null,
  Client extends FavroClient = FavroClient,
> {
  /**
   * Cached, parsed body if response was JSON.
   * If not defined, have not tried to obtain the body.
   * If null, have tried to obtain, but there wasn't one.
   */
  protected _parsedBody?: Data | null;

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
    return stringToNumber(this._response.headers.get('X-RateLimit-Remaining'), {
      defaultIfNullish: Infinity,
      customError: this._client.error,
    });
  }

  get limitResetsAt() {
    return stringToDate(this._response.headers.get('X-RateLimit-Limit'), {
      defaultIfNullish: new Date(),
      customError: this._client.error,
    });
  }

  get limit() {
    return stringToNumber(this._response.headers.get('X-RateLimit-Limit'), {
      defaultIfNullish: Infinity,
      customError: this._client.error,
    });
  }

  get backendId() {
    return (
      this._response.headers.get('X-Favro-Backend-Identifier') || undefined
    );
  }

  get contentType() {
    return this._response.headers.get('Content-Type');
  }

  async getParsedBody() {
    if (typeof this._parsedBody != 'undefined') {
      return this._parsedBody;
    }
    if (!this.contentType?.startsWith('application/json')) {
      this._parsedBody = null;
      return this._parsedBody;
    }
    let responseBody: string | Data = (await this._response.buffer()).toString(
      'utf8',
    );
    try {
      responseBody = JSON.parse(responseBody) as Data;
      this._parsedBody = responseBody;
      return this._parsedBody;
    } catch {
      throw new BravoError(`Could not JSON-parse: ${responseBody}`);
    }
  }

  async isLastPage() {
    const body = await this.getParsedBody();
    if (!dataIsPagedEntity(body)) {
      return true;
    }
    if (body.page >= body.pages - 1) {
      return true;
    }
    return false;
  }

  async getNextPageResponse() {
    if (await this.isLastPage()) {
      return;
    }
    const body = await this.getParsedBody();
    if (!dataIsPagedEntity(body)) {
      return;
    }
    const urlInst = new URL(this._response.url);
    urlInst.searchParams.set('requestId', body.requestId);
    urlInst.searchParams.set('page', `${body.page + 1}`);
    const res = await this._client.request<Data>(urlInst.toString(), {
      backendId: this.backendId,
    });
    return res;
  }

  async getEntitiesData() {
    const body = await this.getParsedBody();
    if (!body) {
      return [];
    }
    if (dataIsPagedEntity(body)) {
      return [...body.entities];
    }
    return [body];
  }
}

//FavroApi.ResponsePaged<DataEntity>
export type FavroResponsePaged<DataEntity> = FavroResponse<
  FavroApi.ResponsePaged<DataEntity>
>;
