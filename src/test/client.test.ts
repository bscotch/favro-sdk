/**
 * @file Test suite for the Bravo client.
 *
 * Favro does not have test environments, and its API is not
 * fully capable of bootstrapping all of the resources needed
 * for full testing. Therefore the developer must do some
 * setup work in a testing-only Favro Organization:
 *
 *  - Create a separate Favro Organization for testing
 *    (to keep your production Favro data safe!)
 *  - A root .env file must be added and include vars:
 *    - FAVRO_TOKEN (obtained from the Favro app)
 *    - FAVRO_USER_EMAIL (email matching the user who owns the token)
 *    - FAVRO_ORGANIZATION_ID (target organization's ID)
 *  - The target Favro organization
 *    must have one custom field per custom field type.
 *    These can be created on any board with any scope.
 *    Currently supported custom field types
 *    (at least one of each must be in your test org):
 *    - Members (regular and custom)
 *    - Tags
 *    - Text
 *    - Number
 *    - Single select
 *    - Multiple Select
 *    - Link
 *    - Date
 *  - Create a uniquely-named Custom Text Field named "Unique Text Field"
 *  - Create at least two Custom Text Fields with the same name: "Repeated Text Field"
 */

import { BravoClient } from '$lib/BravoClient.js';
import { expect } from 'chai';
import fs from 'fs-extra';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import type { BravoCollection } from '$entities/BravoCollection.js';
import type { BravoWidget } from '$entities/BravoWidget.js';
import type { BravoColumn } from '$/lib/entities/BravoColumn.js';
import type { BravoCardInstance } from '$/lib/entities/BravoCard.js';
import {
  stringOrObjectToString,
  stringsOrObjectsToStrings,
} from '$/lib/utility.js';
import type { DataFavroCustomFieldType } from '$/types/FavroCardTypes.js';
import { assertBravoClaim } from '$/lib/errors.js';
import type { BravoUser } from '$/lib/entities/BravoUser.js';

/**
 * @note A root .env file must be populated with the required
 * env vars in order to run tests!
 */
dotenv.config();
const organizationId = process.env.FAVRO_ORGANIZATION_ID!;
const myUserEmail = process.env.FAVRO_USER_EMAIL!;

const testCollectionName = '___BRAVO_TEST_COLLECTION';
const testWidgetName = '___BRAVO_TEST_WIDGET';
const testColumnName = '___BRAVO_TEST_COLUMN';
const testCardName = '___BRAVO_TEST_CARD';
const customFieldUniqueName = `Unique Text Field`;
const customFieldRepeatedName = `Repeated Text Field`;
const customFieldUniquenessTestType = 'Text';

const sandboxRoot = './sandbox';
const samplesRoot = './samples';

/**
 * Some upstream tests cannot be skipped since the create
 * dependencies. To allow skipping most tests during active
 * development, set this to `true`
 */
const SKIP_SKIPPABLE = false;

function canSkip(test: Mocha.Context) {
  if (SKIP_SKIPPABLE) {
    test.skip();
  }
}

class BravoTestError extends Error {
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

/**
 * Get a custom field, and its value on a card, by custom field type.
 *
 * We don't care which custom field we get, just that it is of the right type.
 */
async function getCustomFieldByType<FieldType extends DataFavroCustomFieldType>(
  client: BravoClient,
  card: BravoCardInstance,
  type: FieldType,
  expectToBeSet = false,
) {
  const fields = await client.listCustomFieldDefinitions();
  const field = await fields.find((field) => {
    return field.type === type;
  });
  assertBravoTestClaim(field, `No ${type} custom field found`);
  const onCard = await card.getCustomField<FieldType>(field.customFieldId);
  assertBravoTestClaim(
    onCard.isSet === expectToBeSet,
    `Custom Field not ${expectToBeSet ? 'set' : 'unset'}: ${JSON.stringify(
      [onCard.value, onCard.humanFriendlyValue],
      null,
      2,
    )}`,
  );
  return onCard;
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
  organizationId,
  `For testing, you must include FAVRO_ORGANIZATION_ID in your .env file`,
);
assertBravoTestClaim(
  myUserEmail,
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
  let testCard: BravoCardInstance;
  let testUser: BravoUser;

  // !!!
  // Tests are in a specific order to ensure that dependencies
  // happen first, and cleanup happens last. This is tricky to
  // do with good test design -- to minimize API calls (the limits
  // are low) the tests become dependent on the outcomes of prior tests.

  before(async function () {
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

  it('utility functions behave', async function () {
    expect(stringOrObjectToString({ hello: 'world' }, 'hello')).to.equal(
      'world',
    );
    expect(
      stringsOrObjectsToStrings(
        ['one', { hello: 'two' }, { hello: 'three', goodbye: 10 }],
        'hello',
      ),
    ).to.eql(['one', 'two', 'three']);
  });

  it('can list organizations', async function () {
    canSkip(this);
    const organizations = await client.listOrganizations();
    expect(organizations.length).to.be.greaterThan(0);
  });

  it('can find a specific organization', async function () {
    canSkip(this);
    const org = await client.findOrganizationById(organizationId);
    assertBravoTestClaim(org, 'Org not found');
    assertBravoTestClaim(
      org.organizationId,
      'Organization ID not found on org data',
    );
  });

  it('can find all users for an organization, including self', async function () {
    const partialUsers = await client.listMembers();
    expect(partialUsers.length, 'has partial users').to.be.greaterThan(0);
    const fullUsers = await client.listMembers();
    expect(fullUsers.length, 'has full users').to.be.greaterThan(0);
    testUser = fullUsers.find((u) => u.email == myUserEmail)!;
    assertBravoTestClaim(testUser, 'Current user somehow not found in org');
  });

  it('can find a specific user by email', async function () {
    canSkip(this);
    const me = await client.findMemberByEmail(myUserEmail)!;
    expect(me).to.exist;
    expect(me!.email).to.equal(myUserEmail);
  });

  describe('Collections', function () {
    it('can create a collection', async function () {
      testCollection = await client.createCollection(testCollectionName);
      assertBravoTestClaim(testCollection, 'Collection not created');
    });

    it('can find created collection', async function () {
      canSkip(this);
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
      canSkip(this);
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
      canSkip(this);
      const foundColumn = await testWidget.findColumnByName(testColumnName);
      assertBravoTestClaim(foundColumn);
      expect(foundColumn!.equals(testColumn)).to.be.true;
    });

    it('can create a card', async function () {
      testCard = await testWidget.createCard({ name: testCardName });
      expect(testCard).to.exist;
    });
    it('can fetch a created card', async function () {
      canSkip(this);
      this.timeout(8000);

      const foundCard = await testWidget.findCardInstanceByName(testCardName);
      assertBravoTestClaim(foundCard);
      expect(foundCard!.equals(testCard)).to.be.true;

      // Fetch it again via sequentialId
      const bySequentialId = await client.findCardInstancesBySequentialId(
        foundCard.sequentialId,
      );
      expect(
        (await bySequentialId.getFirstEntity())!.equals(foundCard),
        'can fetch by sequentialId',
      ).to.be.true;

      // Fetch it again via cardId
      const byCardId = await client.findCardInstanceByCardId(foundCard.cardId);
      expect(byCardId!.equals(foundCard), 'can fetch by sequentialId').to.be
        .true;
    });

    it("can update a card's column (status)", async function () {
      canSkip(this);
      // Add another column to the widget to ensure at least 2
      await testWidget.createColumn(testColumnName + '2');

      // Get all columns available to the Card
      const columns = await testCard.listWidgetColumns();
      expect(
        columns.length,
        'should have at least two columns',
      ).to.be.greaterThan(1);

      // Get the current column on the created Card on this board
      const startingColumn = await testCard.getColumn();
      assertBravoTestClaim(startingColumn, 'Should have found matching Column');

      // Change the column to one of the others.
      const endingColumn = columns.find(
        (col) => col.columnId != startingColumn.columnId,
      );
      assertBravoTestClaim(
        endingColumn,
        'should have found a different column',
      );
      await testCard.setColumn(endingColumn);

      // Make sure it truly changed!
      await testCard.refresh();
      expect(testCard.columnId, 'Test Card should have new columnId').to.equal(
        endingColumn.columnId,
      );
      expect(testCard.columnId).to.not.equal(startingColumn.columnId);
    });

    it("can batch-update a card's built-in fields", async function () {
      canSkip(this);
      /**
       * Must be able to set/unset all of:
       * - ✔ name
       * - ✔ description
       * - ✔ startDate
       * - ✔ dueDate
       * - ✔ archived
       * - ✔ tags
       * - ✔ assignment
       * - ✔ assignmentCompletion
       * - ✔ favroAttachments
       */
      const users = await client.listMembers();
      const user = users[0];
      const newName = 'NEW NAME';
      const newDescription = '# New Description\n\nHello!';
      const testDate = new Date();
      const tagName = 'totally-real-tag';
      let updateBuilder = testCard.createNewUpdateBuilder();
      updateBuilder
        .setName(newName)
        .setDescription(newDescription)
        .assign([user.userId])
        // // Cannot attach a card to self! (Get that error message
        // // when we try, implying that the update would otherwise
        // // work.
        // .addFavroAttachments([
        //   { itemCommonId: testCard.cardCommonId, type: 'card' },
        // ])
        .addTagsByName([tagName])
        .completeAssignment([user.userId])
        .setStartDate(testDate)
        .setDueDate(testDate)
        .archive();
      await testCard.update(updateBuilder);
      expect(testCard.detailedDescription).to.equal(newDescription);
      expect(testCard.name).to.equal(newName);
      expect(testCard.assignments[0].userId).to.equal(user.userId);
      expect(testCard.assignments[0].completed).to.equal(true);
      expect(testCard.tags[0]).to.be.a('string');
      expect(testCard.dueDate).to.eql(testDate);
      expect(testCard.startDate).to.eql(testDate);
      expect(testCard.archived).to.equal(true);

      // Unset unsettable values
      updateBuilder = testCard.createNewUpdateBuilder();
      updateBuilder
        .unarchive()
        .removeTagsByName([tagName])
        .uncompleteAssignment([user.userId])
        .unsetDueDate()
        .unsetStartDate();
      await testCard.update(updateBuilder);
      expect(testCard.archived).to.equal(false);
      expect(testCard.dueDate).to.be.null;
      expect(testCard.startDate).to.be.null;
      expect(testCard.tags).to.be.empty;
      expect(testCard.assignments[0].completed).to.be.false;

      // Need to unset the assigned user separately,
      // since we wanted to check that we could uncomplete
      // that user's assignment in the last step.
      updateBuilder = testCard.createNewUpdateBuilder();
      updateBuilder.unassign([user.userId]);
      await testCard.update(updateBuilder);
      expect(testCard.assignments).to.be.empty;
    });
    it("can singly update a Card's built-in fields", async function () {
      canSkip(this);
      const newTitle = 'singleton update';
      await testCard.setName(newTitle);
      expect(testCard.name).to.equal(testCard.name);
    });

    it('can add attachment to a card (and remove it)', async function () {
      canSkip(this);
      const filename = 'hi.txt';
      const attachedText = 'Hello World!';
      const attachment = await client.addAttachmentToCardInstance(
        testCard.cardId,
        filename,
        attachedText,
      );
      expect(attachment).to.exist;
      expect(attachment.name).to.equal(filename);
      const res = await fetch(attachment.fileURL);
      expect(await res.text()).to.equal(attachedText);

      // See that it's now on the card
      await testCard.refresh();
      expect(testCard.attachments[0].name).to.equal(filename);

      // Remove the attachment
      await testCard.update({ removeAttachments: [attachment.fileURL] });
      expect(testCard.attachments).to.be.empty;
    });

    // CUSTOM FIELDS

    it('can find unique custom fields by name or id', async function () {
      canSkip(this);
      // NOTE: requires manual creation of a unique Custom Text field named 'Unique Text Field'
      const fields = await client.listCustomFieldDefinitions();
      const uniqueFields = await fields.filter(
        (d) => d.name == customFieldUniqueName,
      );
      expect(uniqueFields.length, 'Must have one result').to.equal(1);
      const uniqueField = uniqueFields[0];
      expect(uniqueField.name, 'Found field should have correct name').to.equal(
        customFieldUniqueName,
      );
      const sameFieldById = await client.findCustomFieldDefinitionById(
        uniqueField.customFieldId,
      );
      expect(sameFieldById.equals(uniqueField), 'Can fetch by id').to.be.true;
    });

    it('can find non-unique custom fields by name', async function () {
      canSkip(this);
      // NOTE: requires manual creation of at least two Custom Text fields named 'Repeated Text Field'
      const fields = await client.listCustomFieldDefinitions();
      const nonUniqueFields = await fields.filter(
        (d) => d.name == customFieldRepeatedName,
      );
      expect(
        nonUniqueFields.length,
        'Must have more than one result',
      ).to.be.greaterThan(1);
      expect(
        nonUniqueFields.every((f) => f.name == customFieldRepeatedName),
        'Must have all results with same name',
      ).to.be.true;
    });

    it('can find unique custom fields by name from a Card (when not set)', async function () {
      canSkip(this);
      const field = await testCard.getCustomFieldByName(
        customFieldUniqueName,
        customFieldUniquenessTestType,
      );
      expect(field).to.exist;
      expect(field.name).to.equal(customFieldUniqueName);
    });

    it('fails when trying to find a non-unique field by name from a Card (when not set)', async function () {
      canSkip(this);
      await expectAsyncError(() =>
        testCard.getCustomFieldByName(
          customFieldRepeatedName,
          customFieldUniquenessTestType,
        ),
      );
    });

    it('can update a Custom Text Field', async function () {
      // canSkip(this);
      const customField = await getCustomFieldByType(client, testCard, 'Text');
      await testCard.setCustomText(customField, 'New Custom Field Text');
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.humanFriendlyValue).to.equal('New Custom Field Text');
    });

    it('can update a Custom Link Field', async function () {
      canSkip(this);
      const customField = await getCustomFieldByType(client, testCard, 'Link');
      const link = { url: 'https://www.google.com', text: 'Google!' };
      await testCard.setCustomLink(customField, link.url, link.text);
      const updatedField = await testCard.getCustomField(customField);
      assertBravoTestClaim(updatedField.humanFriendlyValue);
      expect(updatedField.humanFriendlyValue).to.eql(link);
    });

    it('can update a Custom Date Field', async function () {
      canSkip(this);
      const customField = await getCustomFieldByType(client, testCard, 'Date');
      const now = new Date();
      await testCard.setCustomDate(customField, now);
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.humanFriendlyValue?.getTime()).to.equal(
        now.getTime(),
      );
    });

    it('can update a Custom Number Field', async function () {
      canSkip(this);
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Number',
      );
      await testCard.setCustomNumber(customField, 99);
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.humanFriendlyValue).to.equal(99);
    });

    it('can update a Custom Vote Field', async function () {
      canSkip(this);
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Voting',
      );
      await testCard.setCustomVote(customField, true);
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.humanFriendlyValue?.tally).to.equal(1);
      expect(updatedField.humanFriendlyValue?.voters).to.eql([testUser.userId]);
    });

    it('can update a Custom Rating Field', async function () {
      canSkip(this);
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Rating',
      );
      await testCard.setCustomRating(customField, 3);
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.humanFriendlyValue).to.equal(3);
    });

    it('can update a Custom Status Field', async function () {
      // Find a custom text field to test
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Single select',
      );
      const newStatusId = customField.customFieldItems[0].customFieldItemId;
      assertBravoClaim(newStatusId, 'Should have a status ID');
      await testCard.setCustomStatusByStatusId(customField, newStatusId);
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.chosenOptions[0].customFieldItemId).to.equal(
        newStatusId,
      );
    });

    xit('can update a Custom Tags Field', async function () {});

    xit('can update a Custom Members Field', async function () {});

    xit('can update a Custom Muliple Select Field', async function () {});

    it('can delete a created card', async function () {
      // Can't delete the last column, so we need to make another to delete!
      await testCard.delete();
      expect(
        await testWidget.findCardInstanceByName(testCardName),
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
    console.log(client.requestStats);
  });
});
