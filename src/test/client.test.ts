/**
 * @file Test suite for the Bravo client.
 *
 * Favro does not have test environments, and its API is not
 * fully capable of bootstrapping all of the resources needed
 * for full testing. Therefore the developer must do some
 * manual setup work in a Favro Organization created for testing:
 *
 * ## TESTING SETUP
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
import fetch from 'node-fetch';
import type { BravoCollection } from '$entities/BravoCollection.js';
import type { BravoWidget } from '$entities/BravoWidget.js';
import type { BravoColumn } from '$/lib/entities/BravoColumn.js';
import type { BravoCardInstance } from '$/lib/entities/BravoCard.js';
import {
  generateRandomString,
  stringOrObjectToString,
  stringsOrObjectsToStrings,
} from '$/lib/utility.js';
import { assertBravoClaim } from '$/lib/errors.js';
import type { BravoUser } from '$/lib/entities/BravoUser.js';
import type { BravoTagDefinition } from '$/lib/entities/BravoTag.js';
import type { FavroApi } from '$types/FavroApi.js';
import { BravoWebhookDefinition } from '$/lib/entities/BravoWebhook.js';
import type { BravoGroup } from '$/types/Bravo.js';
import {
  pagingTestMinCards,
  pagingTestWidgetName,
  populateTestOrg,
} from './utility/populateTestOrg.js';

/**
 * @remarks A root .env file must be populated with the required
 * env vars in order to run tests!
 */
const organizationId = process.env.FAVRO_ORGANIZATION_ID!;
const myUserEmail = process.env.FAVRO_USER_EMAIL!;

const testCollectionName = '___BRAVO_TEST_COLLECTION';
const testWidgetName = '___BRAVO_TEST_WIDGET';
const testColumnName = '___BRAVO_TEST_COLUMN';
const testCardName = '___BRAVO_TEST_CARD';
const testTagName = '___BRAVO_TEST_TAG';
const testWebhookName = '___BRAVO_TEST_WEBHOOK';
const testGroupName = '___BRAVO_TEST_GROUP';
const testWebhookUrl =
  'https://webhook.site/b287bde2-3f81-4d41-ba78-4c36eacdd472';
let testWebhookSecret: string; // Set later with random characters every run
const customFieldUniqueName = `Unique Text Field`;
const customFieldRepeatedName = `Repeated Text Field`;
const customFieldUniquenessTestType = 'Text';

/**
 * Some upstream tests cannot be skipped since they create
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
async function getCustomFieldByType<FieldType extends FavroApi.CustomFieldType>(
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
  let testTag: BravoTagDefinition;
  let testWebhook: BravoWebhookDefinition;
  let testGroup: BravoGroup;

  // !!!
  // Tests are in a specific order to ensure that dependencies
  // happen first, and cleanup happens last. This is tricky to
  // do with good test design -- to minimize API calls (the limits
  // are low) the tests become dependent on the outcomes of prior tests.

  before(async function () {
    client.disableDebugLogging();
    // Clean up any leftover remote testing content
    // (Since names aren't required to be unique, there could be quite a mess!)
    // NOTE:
    await (await client.findTagDefinitionByName(testTagName))?.delete();
    await client.deleteGroupByName(testGroupName);
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
    testWebhookSecret = await generateRandomString(32, 'base64');
    await populateTestOrg(client);
    client.clearCache();
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
    expect(await generateRandomString(100, 'ascii')).to.have.length(100);
  });

  it('can verify a signed webhook', async function () {
    // Webhook signatures arrive via the x-favro-webhook header
    // The samples here were collected during a test run
    const sampleSecret = 'EnBW+mo+AwtsJq/13Y0zzTRRGbEYXdtRL9qvMdwoDfc=';
    const sampleUrl =
      'https://webhook.site/b287bde2-3f81-4d41-ba78-4c36eacdd472';
    const sampleSignatures = [
      {
        signature: '8qrs8J644WeWEpLMOG36i+bMEOU=',
        payloadId: 'z1D/epgkofeldJHGSTZh5/eQBvE=',
      },
      {
        signature: 'lgkQZ7e4H9LvDVtcNoVb9A+qyPs=',
        payloadId: 'Elo7wiI/rR4ps2fJa664w3s3pcc=',
      },
      {
        signature: 'cKJzp8jB9sZwi5967JalX5oPt2g=',
        payloadId: 'itcWkSzfpRuuqp2CJCB6+ALmT/o=',
      },
    ];
    for (const sample of sampleSignatures) {
      expect(
        await BravoWebhookDefinition.isValidWebhookSignature(
          sampleUrl,
          sampleSecret,
          sample.payloadId,
          sample.signature,
        ),
        `Signature ${sample.signature} should be valid`,
      ).to.be.true;
    }
  });

  it('can page multi-page responses', async function () {
    const pagingTestWidget = await client.findWidgetByName(
      pagingTestWidgetName,
    );
    assertBravoTestClaim(pagingTestWidget, 'Paging test widget not found');
    const cardsList = await client.listCardInstances({
      widgetCommonId: pagingTestWidget.widgetCommonId,
    });
    const allCards = await cardsList.getAllEntities();
    expect(allCards.length).to.be.greaterThanOrEqual(pagingTestMinCards);
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

  it('can create a group', async function () {
    testGroup = await client.createGroup({
      name: testGroupName,
      members: [{ userId: testUser.userId, role: 'administrator' }],
    });
    expect(testGroup).to.exist;
    expect(testGroup!.name).to.equal(testGroupName);
  });

  it('can update a group', async function () {
    await testGroup.update({
      members: [{ email: testUser.email, delete: true }],
    });
    expect(testGroup.members.length).to.equal(0);
  });

  describe('Tags', function () {
    it('can create a tag', async function () {
      const tag = await client.createTagDefinition({
        name: testTagName,
        color: 'purple',
      });
      expect(tag.name).to.equal(testTagName);
      expect(tag.color).to.equal('purple');
      testTag = tag;
    });

    it('can find tags', async function () {
      const tags = await client.listTagDefinitions();
      const matchingTestTag = await tags.find(
        (tag) => tag.name === testTagName,
      );
      assertBravoClaim(matchingTestTag, 'Tag not found');
      expect(
        testTag.equals(matchingTestTag),
        'Should find created tag with exhaustive search by name',
      ).to.be.true;

      expect(
        testTag.equals((await tags.findById('tagId', testTag.tagId))!),
        'Should be able to find tag using find-by-id cache',
      ).to.be.true;
    });
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
        color: 'purple',
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

    it('can list all widgets', async function () {
      expect((await client.listWidgets()).length).to.be.greaterThan(0);
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

      expect(
        (await client.findColumnById(testColumn.columnId))?.equals(foundColumn),
        'Should be able to directly find',
      ).to.be.true;
    });

    it('can create a webhook', async function () {
      await testWidget.createColumn('ANOTHER ONE');
      const allColumns = await testWidget.listColumns();
      assertBravoTestClaim(
        allColumns.length > 1,
        'Should have at least 2 columns',
      );
      const columnIds = allColumns.map((c) => c.columnId);
      testWebhook = await testWidget.createWebhook({
        name: testWebhookName,
        secret: testWebhookSecret,
        postToUrl: testWebhookUrl,
        options: {
          columnIds,
          notifications: BravoWebhookDefinition.cardEventNames,
        },
      });
      assertBravoTestClaim(testWebhook, 'Should be able to create webhook');
      expect(testWebhook.name).to.equal(testWebhookName);
      expect(testWebhook.secret).to.equal(testWebhookSecret);
      expect(testWebhook.postToUrl).to.equal(testWebhookUrl);
      expect(testWebhook.columnIds).to.eql(columnIds);
      expect(
        testWebhook.notifications.sort(),
        'Should have same notifications',
      ).to.eql(BravoWebhookDefinition.cardEventNames.sort());
    });

    it('can fetch a created webhook', async function () {
      const webhooks = await testWidget.listWebhooks();
      expect(webhooks.length).to.be.greaterThan(0);
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
      client.enableDebugLogging(['bravo:http:*', '-bravo:http:headers']);
      const bySequentialId = await client.findCardInstancesBySequentialId(
        foundCard.url,
      );
      client.disableDebugLogging();
      expect(bySequentialId[0]!.equals(foundCard), 'can fetch by sequentialId')
        .to.be.true;

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
       * - ??? name
       * - ??? description
       * - ??? startDate
       * - ??? dueDate
       * - ??? archived
       * - ??? tags
       * - ??? assignment
       * - ??? assignmentCompletion
       * - ??? favroAttachments
       */
      const users = await client.listMembers();
      const user = users[0];
      const newName = 'NEW NAME';
      const newDescription = '# New Description\n\nHello!';
      const testDate = new Date();
      const tagName = 'totally-real-tag';
      client.enableDebugLogging('bravo:http:*');
      let updateBuilder = testCard.createNewUpdateBuilder();
      updateBuilder
        .setName(newName)
        .setDescription(newDescription)
        .assign([user.userId, testGroup.groupId])
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
      client.disableDebugLogging();
      expect(testCard.detailedDescription).to.equal(newDescription);
      expect(testCard.name).to.equal(newName);
      let userAssignment = testCard.assignments.find(
        (a) => a.userId === user.userId,
      );
      let groupAssignment = testCard.assignments.find(
        (a) => a.userId === testGroup.groupId,
      );
      expect(userAssignment).to.exist;
      expect(groupAssignment).to.exist;
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
      userAssignment = testCard.assignments.find(
        (a) => a.userId === user.userId,
      );
      groupAssignment = testCard.assignments.find(
        (a) => a.userId === testGroup.groupId,
      );
      expect(userAssignment).to.not.exist;
      expect(groupAssignment).to.exist;
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
      // canSkip(this);
      // Find a custom text field to test
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Single select',
      );
      const newStatusId = customField.customFieldItems[0].customFieldItemId;
      assertBravoClaim(newStatusId, 'Should have a status ID');
      await testCard.setCustomSingleSelect(customField, newStatusId);
      const updatedField = await testCard.getCustomField(customField);
      expect(updatedField.chosenOptions[0].customFieldItemId).to.equal(
        newStatusId,
      );
    });

    xit('can update a Custom Tags Field', async function () {});

    it('can update a Custom Members Field', async function () {
      canSkip(this);
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Members',
      );
      await testCard.addCustomMembers(customField, [testUser]);
      await testCard.completeCustomMembers(customField, [testUser]);
      let updatedField = await testCard.getCustomField(customField);
      expect(updatedField.assignedTo).to.eql([testUser.userId]);
      await testCard.removeCustomMembers(customField, [testUser]);
      updatedField = await testCard.getCustomField(customField);
      expect(updatedField.assignedTo).to.eql([]);
    });

    it('can update a Custom Muliple Select Field', async function () {
      const customField = await getCustomFieldByType(
        client,
        testCard,
        'Multiple select',
      );
      const newStatuses = customField.customFieldItems!;
      assertBravoClaim(newStatuses.length, 'Should have a status ID');
      await testCard.setCustomMulipleSelect(customField, newStatuses);
      const updatedField = await testCard.getCustomField(customField);
      const expectedIds = newStatuses.map((s) => s.customFieldItemId).sort();
      const actualIds = updatedField.chosenOptions
        .map((o) => o.customFieldItemId)
        .sort();
      expect(expectedIds).to.eql(actualIds);
    });

    it('can delete a created card', async function () {
      // Can't delete the last column, so we need to make another to delete!
      await testCard.delete();
      expect(
        await testWidget.findCardInstanceByName(testCardName),
        'Should not find deleted card',
      ).to.be.undefined;
    });

    it('can delete a created webhook', async function () {
      await testWebhook.delete();
      expect(
        await testWidget.findWebhookByName(testWebhookName),
        'Should not find deleted webhook',
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

    it('can delete a group', async function () {
      await client.deleteGroupById(testGroup.groupId);
      expect(await client.listGroups()).to.have.length(0);
    });
  });

  after(function () {
    console.log(client.requestStats);
  });
});
