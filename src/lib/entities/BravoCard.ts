import type { DataFavroCard } from '$/types/FavroCardTypes.js';
import { BravoEntity } from '$lib/BravoEntity.js';

export class BravoCard extends BravoEntity<DataFavroCard> {
  get name() {
    return this._data.name;
  }

  /** The card's ID within a widget */
  get cardId() {
    return this._data.cardId;
  }

  /** The card's global ID, the same in all widgets in which this card appears */
  get cardCommonId() {
    return this._data.cardCommonId;
  }

  get columnId() {
    return this._data.columnId;
  }

  get parentCardId() {
    return this._data.parentCardId;
  }

  get widgetCommonId() {
    return this._data.widgetCommonId;
  }

  get tags() {
    return [...this._data.tags];
  }

  get detailedDescription() {
    return this._data.detailedDescription;
  }

  get attachments() {
    return this._data.attachments;
  }

  /**
   * Delete this card from its Widget (the one it
   * was fetched from in search results). Optionally
   * delete it everywhere else, too!
   */
  async delete(everywhere = false) {
    return this._client.deleteCard(this.cardId, everywhere);
  }

  equals(org: BravoCard) {
    return (
      this.hasSameConstructor(org) && this.cardCommonId === org.cardCommonId
    );
  }
}
