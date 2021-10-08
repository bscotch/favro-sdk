/**
 * @file
 *
 * 💥⚠️ **WARNING** ⚠️💥
 *
 * Use with caution! When run, this will populate the org
 * whose ID is in the root .env file with a huge batch
 * of cards and custom fields. This is to allow testing
 * of paging, since Favro API pages are 100 items long.
 */

import type { BravoClient } from '../../index.js';

export const pagingTestCollectionName = '__BRAVO_POP';
export const pagingTestWidgetName = '__BRAVO_POP_WIDGET';
export const pagingTestCardPrefix = '__BRAVO_POP_CARD';
export const pagingTestColumnName = '__BRAVO_POP_COLUMN';
export const pagingTestMinCards = 110;

export async function populateTestOrg(client: BravoClient) {
  // Add a Collection, so that at least things can be kept separate
  const testCollection =
    (await client.findCollectionByName(pagingTestCollectionName)) ||
    (await client.createCollection(pagingTestCollectionName));

  const testWidget =
    (await client.findWidgetByName(
      pagingTestWidgetName,
      testCollection.collectionId,
    )) ||
    (await client.createWidget(
      testCollection.collectionId,
      pagingTestWidgetName,
    ));

  const testColumn =
    (await client.findColumn(
      testWidget.widgetCommonId,
      (col) => col.name == pagingTestColumnName,
    )) ||
    (await client.createColumn(
      testWidget.widgetCommonId,
      pagingTestColumnName,
    ));

  const testCards = await (
    await client.listCardInstances({
      widgetCommonId: testWidget.widgetCommonId,
      columnId: testColumn.columnId,
    })
  ).getAllEntities();

  const testCardCount = testCards.length;
  if (testCardCount < pagingTestMinCards) {
    const newCount = pagingTestMinCards - testCardCount;
    console.log('Creating', newCount, 'cards');
    for (const i of Array(newCount).keys()) {
      const newField = await client.createCard({
        widgetCommonId: testWidget.widgetCommonId,
        name: `${pagingTestCardPrefix}_${i + testCardCount}`,
        columnId: testColumn.columnId,
      });
      testCards.push(newField);
    }
  }
}
