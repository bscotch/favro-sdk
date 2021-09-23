import { BravoEntity } from '../BravoEntity.js';
import type { FavroApi } from '$types/FavroApi.js';
import crypto from 'crypto';

type EventName = FavroApi.WebhookDefinition.ModelFieldValue.EventName;

export class BravoWebhookDefinition extends BravoEntity<FavroApi.WebhookDefinition.Model> {
  get name() {
    return this._data.name;
  }

  get webhookId() {
    return this._data.webhookId;
  }

  get widgetCommonId() {
    return this._data.widgetCommonId;
  }

  get postToUrl() {
    return this._data.postToUrl;
  }

  get secret() {
    return this._data.secret;
  }

  get columnIds() {
    return this._data.options.columnIds;
  }

  get notifications() {
    return this._data.options.notifications;
  }

  /** Delete this webhookDefinition from Favro. **Use with care!** */
  async delete() {
    if (this.deleted) {
      return;
    }
    await this._client.deleteWebhookById(this.webhookId);
    this._deleted = true;
  }

  equals(webhookDefinition: BravoWebhookDefinition) {
    return (
      this.hasSameConstructor(webhookDefinition) &&
      this.webhookId === webhookDefinition.webhookId
    );
  }

  async isValidWebhookSignature(payloadId: string, signature: string) {
    return await BravoWebhookDefinition.isValidWebhookSignature(
      this.postToUrl,
      this.secret,
      payloadId,
      signature,
    );
  }

  /**
   * Favro signs webhook requests so you can optionally
   * verify that they originated from Favro. Each webhook
   * trigger contains the HTTP header X-Favro-Webhook.
   * The header is a base64 digest of an HMAC-SHA1 hash.
   * The hashed content is the concatenation of the
   * payloadId and the URL exactly as it was provided
   * during webhook creation.
   *
   * https://favro.com/developer/#webhook-signatures
   */
  static async isValidWebhookSignature(
    url: string,
    secret: string,
    payloadId: string,
    signature: string,
  ) {
    const expected = crypto
      .createHmac('sha1', secret)
      .update(payloadId + url)
      .digest('base64');
    return signature === expected;
  }

  static get cardEventNames() {
    const events: EventName[] = [
      'Card committed',
      'Card created',
      'Card moved',
      'Card removed',
      'Card updated',
    ];
    return events;
  }
}
