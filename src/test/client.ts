import { BravoClient } from '$lib/BravoClient.js';
import { expect } from 'chai';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import type { BravoCollection } from '$entities/BravoCollection.js';
import type { BravoWidget } from '$entities/BravoWidget.js';
import type { BravoColumn } from '$/lib/entities/BravoColumn.js';
import { BravoCard } from '$/lib/entities/BravoCard.js';

/**
 * @note A root .env file must be populated with the required
 * env vars in order to run tests!
 */
dotenv.config();
const organizationName = process.env.FAVRO_ORGANIZATION_NAME!;
const myUserEmail = process.env.FAVRO_USER_EMAIL!;

const testCollectionName =
  process.env.BRAVO_TEST_COLLECTION_NAME || '___BRAVO_TEST_COLLECTION';
const testWidgetName = '___BRAVO_TEST_WIDGET';
const testColumnName = '___BRAVO_TEST_COLUMN';
const testCardName = '___BRAVO_TEST_CARD';

const sandboxRoot = './sandbox';
const samplesRoot = './samples';

export class BravoTestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BravoTestError';
    Error.captureStackTrace(this, this.constructor);
  }
}

function assertBravoTestClaim(
  claim: any,
  message = 'Assertion failed',
): asserts claim {
  if (!claim) {
    throw new BravoTestError(message);
  }
}

async function expectAsyncError(
  failingFunc: (...args: any[]) => any,
  message = 'Expected an async error',
) {
  try {
    await failingFunc();
  } catch {
    return;
  }
  throw new BravoTestError(message);
}

assertBravoTestClaim(
  organizationName,
  `For testing, you must include FAVRO_ORGANIZATION_NAME in your .env file`,
);
assertBravoTestClaim(
  organizationName,
  `For testing, you must include FAVRO_USER_EMAIL in your .env file`,
);

/**
 * Clone any files in a "./samples" folder into
 * a "./sandbox" folder, overwriting any files
 * currently in there. This is useful for allowing
 * your test suite to make changes to files without
 * changing the originals, so that you can easily
 * reset back to an original state prior to running a test.
 */
function resetSandbox() {
  if (!fs.existsSync(samplesRoot)) {
    // Then no samples exist, and no sandbox needed
    return;
  }
  fs.ensureDirSync(sandboxRoot);
  fs.emptyDirSync(sandboxRoot);
  fs.copySync(samplesRoot, sandboxRoot);
}

describe('BravoClient', function () {
  // Use a single client for tests, so that we can
  // do some caching and avoid hitting the strict
  // rate limits.

  const client = new BravoClient();
  let testWidget: BravoWidget;
  let testCollection: BravoCollection;
  let testColumn: BravoColumn;
  let testCard: BravoCard;

  // !!!
  // Tests are in a specific order to ensure that dependencies
  // happen first, and cleanup happens last. This is tricky to
  // do with good test design -- to minimize API calls (the limits
  // are low) the tests become dependent on the outcomes of prior tests.

  before(async function () {
    await client.setOrganizationIdByName(organizationName);

    resetSandbox();
    // Clean up any leftover remote testing content
    // (Since names aren't required to be unique, there could be quite a mess!)
    // NOTE:
    while (true) {
      const collection = await client.findCollectionByName(testCollectionName);
      if (!collection) {
        break;
      }
      for (const widget of await collection.listWidgets()) {
        if (!widget) {
          break;
        }
        // TODO: delete cards
        await widget.delete();
      }
      await collection.delete();
    }
  });

  it('can list organizations', async function () {
    const organizations = await client.listOrganizations();
    expect(organizations.length).to.be.greaterThan(0);
  });

  it('can find a specific organization', async function () {
    const org = await client.findOrganizationByName(
      process.env.FAVRO_ORGANIZATION_NAME!,
    );
    assertBravoTestClaim(org, 'Org not found');
    assertBravoTestClaim(
      org.organizationId,
      'Organization ID not found on org data',
    );
    client.organizationId = org.organizationId;
    assertBravoTestClaim(org.organizationId == client.organizationId);
  });

  it('can find all users for an organization, including self', async function () {
    const partialUsers = await client.listOrganizationMembers();
    expect(partialUsers.length, 'has partial users').to.be.greaterThan(0);
    const fullUsers = await client.listFullUsers();
    expect(fullUsers.length, 'has full users').to.be.greaterThan(0);
    const me = fullUsers.find((u) => u.email == myUserEmail);
    assertBravoTestClaim(me, 'Current user somehow not found in org');
  });

  it('can find a specific user by email', async function () {
    const me = await client.findUserByEmail(myUserEmail);
    expect(me).to.exist;
    expect(me.email).to.equal(myUserEmail);
  });

  describe('Collections', function () {
    it('can create a collection', async function () {
      testCollection = await client.createCollection(testCollectionName);
      assertBravoTestClaim(testCollection, 'Collection not created');
    });

    it('can find created collection', async function () {
      const foundCollection = await client.findCollectionByName(
        testCollectionName.toLocaleLowerCase(),
        { ignoreCase: true },
      );
      assertBravoTestClaim(foundCollection, 'Collection not created');
      expect(
        foundCollection.equals(testCollection),
        'Found and created collections should match',
      ).to.be.true;
    });

    it('can create a widget', async function () {
      testWidget = await testCollection.createWidget(testWidgetName, {
        color: 'cyan',
      });
      expect(testWidget, 'Should be able to create widget').to.exist;
    });

    it('can find created widget', async function () {
      // Grab the first widget found
      const widget = await testCollection.findWidgetByName(
        testWidgetName.toLocaleLowerCase(),
        { ignoreCase: true },
      );
      assertBravoTestClaim(widget, 'Should be able to fetch created widget');
      expect(
        widget.equals(testWidget),
        'Found widget should match created widget',
      ).to.be.true;
    });

    it('can create a column', async function () {
      testColumn = await testWidget.createColumn(testColumnName);
      expect(testColumn).to.exist;
    });
    it('can find a created column', async function () {
      const foundColumn = await testWidget.findColumnByName(testColumnName);
      assertBravoTestClaim(foundColumn);
      expect(foundColumn!.equals(testColumn)).to.be.true;
    });

    it('can create a card', async function () {
      testCard = await testWidget.createCard({ name: testCardName });
      expect(testCard).to.exist;
    });
    it('can fetch a created card', async function () {
      const foundCard = await testWidget.findCardByName(testCardName);
      assertBravoTestClaim(foundCard);
      expect(foundCard!.equals(testCard)).to.be.true;
    });
    // TODO: NEXT HEIRARCHY LEVEL
    it('can delete a created card', async function () {
      // Can't delete the last column, so we need to make another to delete!
      await testCard.delete();
      expect(
        await testWidget.findCardByName(testCardName),
        'Should not find deleted card',
      ).to.be.undefined;
    });

    it('can delete a created column', async function () {
      // Can't delete the last column, so we need to make another to delete!
      const deletableName = 'DELETE ME';
      const deletableColumn = await testWidget.createColumn(deletableName);
      assertBravoTestClaim(deletableColumn);
      await deletableColumn.delete();
      expect(
        await testWidget.findColumnByName(deletableName),
        'Should not find deleted column',
      ).to.be.undefined;
    });

    it('can delete a created widget', async function () {
      await testWidget.delete();
      await expectAsyncError(
        () => client.findWidgetById(testWidget.widgetCommonId),
        'Should not find deleted widget',
      );
    });

    it('can delete a created collection', async function () {
      await testCollection.delete();
      await expectAsyncError(
        () => client.findCollectionById(testCollection.collectionId),
        'Should not find deleted collection',
      );
    });
  });

  after(function () {
    resetSandbox();
  });

  after(function () {});
});
