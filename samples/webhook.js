/**
 * @file
 *
 * This is a formatted sample webhook payload, triggered
 * by moving a card from one status to another and caught
 * in Zapier to see the raw content. The card in question
 * has a Markdown body (which gets stripped of its Markdown
 * components in the `detailedDescription` field here). It
 * has misc. attachments, a handful of custom fields, tags,
 *
 *
 * It's presented here as JavaScript, even though the raw
 * data is JSON, so that comments can be added and the types
 * can be tested against real data.
 */

const sampleWebhookAsJs = {
  /**
   * The `payloadId` is presumably unique to this data
   * when it comes from a webhook. An API response with
   * card data presumably contains an array of card objects
   * (when paged) or all card fields spread into the base
   * response object (when non-paged).
   */
  payloadId: '6A0Fs+vzgNB6MOXvv09nFiPFT5c=',
  /** @type {import('../src/types/FavroCardTypes').DataFavroCard} */
  card: {
    cardId: 'a1ad7bbd9b9eef25333bd35a',
    cardCommonId: '9c8423663686bbe7dae708ea',
    organizationId: 'a54080567a378c8e20d2826f',
    archived: false,
    position: 0,
    listPosition: 0,
    name: 'Update landing page layout',
    widgetCommonId: '2e6e29d22ea50f7c947efebf',
    columnId: '69a61680bc034be3ed153acf',
    laneId: null,
    isLane: false,
    parentCardId: null,
    sheetPosition: 0,
    detailedDescription:
      '\n\n☑ CHeclist item!\n\nHEADER\ntable\nwith\ncolumns\n1\n2\n\n• bullet\n• list\n\n\n\n',
    tags: ['aRoxiceQ4ouk38pNz'],
    sequentialId: 4,
    startDate: '2021-07-02T14:00:00.000Z',
    dueDate: '2021-07-04T15:00:00.000Z',
    assignments: [{ userId: 'CynhwjuAkAx54JjLk', completed: true }],
    numComments: 2,
    tasksTotal: 1,
    tasksDone: 1,
    attachments: [
      {
        name: 'kanban-placeholder.png',
        fileURL:
          'https://favro.s3.eu-central-1.amazonaws.com/1e2332b2-80be-43c0-a505-b7b64d1947d3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJ23AK7LCTC6R6CCA%2F20210702%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210702T224459Z&X-Amz-Expires=86400&X-Amz-Signature=ff55135dfa1992697b34ef119987b47fbff0a32d52a91df317b5fb3b85e13f15&X-Amz-SignedHeaders=host',
        thumbnailURL:
          'https://favro.s3.eu-central-1.amazonaws.com/b1258a84-81b4-4314-9c89-06f29b1798f2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJ23AK7LCTC6R6CCA%2F20210702%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210702T224459Z&X-Amz-Expires=86400&X-Amz-Signature=faa068da6d2aa60d1c8b12d688dbbc13e6020f20bdad0e6ef1fa42c26323b772&X-Amz-SignedHeaders=host',
      },
      {
        name: 'guild-joins-by-source.csv',
        fileURL:
          'https://favro.s3.eu-central-1.amazonaws.com/d309e8a4-9248-4766-ba9a-761c81cf7c0e.csv?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAJ23AK7LCTC6R6CCA%2F20210702%2Feu-central-1%2Fs3%2Faws4_request&X-Amz-Date=20210702T224459Z&X-Amz-Expires=86400&X-Amz-Signature=7fc8348966f4811d9085d684eb5b2efee8b374936ad10e903637408d2bd90b17&X-Amz-SignedHeaders=host',
      },
    ],
    customFields: [
      { customFieldId: 'Q7RP38yk3q9HPiZDo', value: ['gQwLpxheP9mw87amz'] },
      { customFieldId: 'bvQrNMuoy5C252XqJ', value: ['8Cd44r5xT2tg9FXeb'] },
      {
        customFieldId: 'MZy7Bwwjt5YFKBHE8',
        link: { url: 'www.google.com', text: 'Google Link!' },
      },
      { customFieldId: 'mEXSNAnxvAeqED8Qb', value: ['irX7ebA4DWc5DFHXj'] },
      {
        customFieldId: 'kGeTZD7MY2DodwLZ5',
        value: 'Some info about stuff',
      },
      { customFieldId: 'nMjPPkqCYkGYYTbzE', value: ['sepX5sfi5hGR5SCPP'] },
    ],
    timeOnBoard: { time: 9621851, isStopped: false },
    timeOnColumns: {
      '852b63ae09f06175f21a1a2f': 7879317,
      '69a61680bc034be3ed153acf': 1742536,
    },
    favroAttachments: [
      { type: 'card', itemCommonId: 'e224ff87611a18d04298a8b5' },
    ],
  },
};
