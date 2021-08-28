<p align="center"><i><a href="https://www.bscotch.net">Butterscotch Shenanigans</a> Presents:</i></p>

<h1 align="center">Bravo</h1>
<h2 align="center">The <i>(unofficial)</i> Favro SDK</h2>

> **⚠Warning⚠** *Bravo is in active development and may change substantially with any release. Check the changelog before updating!*

> **⚠Warning⚠** *Bravo features are likely under-tested as they come out, do your own testing before using in production, and use at your own risk!*

## Features

- 💧 Favro data is hydrated into feature-rich and explorable classes, with convenience functions galore
- 🤖 Fully typed (with Typescript) so your IDE can do tons of the work for you
- ⚡ All core methods are available from the Bravo Client class. Widget, Card, and other hydrated classes provide simplified shortcuts to those same methods, with details already filled in for you.
- 🔐 Credentials and Favro-specific request details handled automatically
- 💤 Lazy-loading of search results to minimize API calls

See the [Roadmap](./ROADMAP.md) for which Favro API features are implemented, planned, or backburnered.

## Why?

[Favro](https://www.favro.com/) is an amazing project management tool
and a great way to centralize all kinds of workflows. However, Favro's integrations with external tools and services, and its own internal automations, are limited.

Fortunately, Favro provides an [HTTP API and Webhooks](https://favro.com/developer) so developers can fill in those gaps themselves. Unfortunately, using raw HTTP APIs is unpleasant and time-consuming. That's where Bravo comes in!

_[Butterscotch Shenanigans&reg;](https://www.bscotch.net) and Bravo (this project) are not affiliated with Favro._

## Quick Start

Install [from npm](https://www.npmjs.com/package/@bscotch/bravo):

`npm install -g @bscotch/bravo`

Then import Bravo into your Node project, instance a Bravo client, and you're all set!

```ts
// ESM-style (Typescript)
import {BravoClient} from '@bscotch/bravo';
// -or-
// CommonJS-style (regular Node)
const {BravoClient} = require('@bscotch/bravo');

// Create a new Bravo Client, then start talking to Favro with it!
const bravoClient = new BravoClient({
  token:'your-token',
  userEmail: 'your-favro-account-email',
  organizationId:'your-organization-id',
});
```

## Table of Contents
1. [Features](#features)
2. [Why?](#why)
3. [Quick Start](#quick-start)
4. [Table of Contents](#table-of-contents)
5. [Authentication](#authentication)
6. [Dependencies](#dependencies)
7. [Recipes](#recipes)
   1. [Create a Bravo Client](#create-a-bravo-client)
   2. [Create a New Card](#create-a-new-card)
   3. [Search Existing Cards](#search-existing-cards)
   4. [Update a Common Field on a Card](#update-a-common-field-on-a-card)
   5. [Batch-Update a Card's Common Fields](#batch-update-a-cards-common-fields)
   6. [Add a Card Attachment](#add-a-card-attachment)
   7. [Ensure up-to-date data (clear caches)](#ensure-up-to-date-data-clear-caches)
8. [The Favro Data Model](#the-favro-data-model)
   1. [Collections](#collections)
   2. [Widgets (a.k.a. "Boards")](#widgets-aka-boards)
   3. [Columns (a.k.a. "Board Statuses")](#columns-aka-board-statuses)
   4. [Cards](#cards)
   5. [Built-In Card Fields](#built-in-card-fields)
   6. [Custom Fields](#custom-fields)
9. [Tips, Tricks, and Limitations](#tips-tricks-and-limitations)
   1. [API Rate Limits](#api-rate-limits)
   2. [Searching](#searching)
   3. [Member fields & "completion"](#member-fields--completion)
   4. [Limited Markdown](#limited-markdown)
   5. [Identifiers](#identifiers)
      1. [Card Sequential IDs](#card-sequential-ids)
      2. [Widget-specific `cardId`s](#widget-specific-cardids)
   6. [Creating Boards](#creating-boards)

## Authentication

To have Bravo access Favro on your behalf, you'll need to provide it with the credentials listed below. You can do so via environment variables as shown here, or directly when instancing the Bravo client as shown in the example above:

1. `FAVRO_TOKEN`: Your Favro API token. To create one, go to your Profile, then "API Tokens" &rarr; "New API Token".
2. `FAVRO_USER_EMAIL`: Your Favro account email.
3. `FAVRO_ORGANIZATION_ID`: The Organization ID that you are targeting. You can get your Organization ID from the URL when using Favro in a browser. Favro URLs look like this: `favro.com/organization/{organizationId}`.

## Dependencies

- [**Node.js v14+**](https://nodejs.org/)
- ⚠ Does not work in browser environments!

## Recipes

In this section you'll find examples of common things you might want to do with the Favro API via Bravo.

### Create a Bravo Client

The Bravo Client is the central tool for interacting with Favro. It has methods for all of the core Favro API functionality, though many of those methods return instances of other Favro objects (Widgets, Cards, Custom Fields, etc). Those other hydrated objects have convenience methods to make it even easier to work with the Favro API.

```ts
const {BravoClient} = require('@bscotch/bravo');

const bravoClient = new BravoClient({
  token:'your-token',
  userEmail: 'your-favro-account-email',
  organizationId:'your-organization-id',
});
```

### Create a New Card

If you know the ID of the Widget you want to add it to, create the Card directly from the Client method:

```ts
const card = await bravoClient.createCard({
  widgetCommonId: 'the-widget-id',
  name: 'Talk to so-and-so',
  detailedDescription: 'We need to maximize synergy.'
});
```

You can also create new Cards from a Widget instance:

```ts
// Find the Widget you want to add a Card to
const widget = await bravoClient.findWidgetByName('My To Do List');

// Create the new Card
const card = await widget.createCard({
  name: 'Talk to so-and-so',
  detailedDescription: 'We need to maximize synergy.'
});
```

### Search Existing Cards

Reflecting how the Favro API works, what you think of as a single Card is actually a separate Card Instance per Widget that the Card lives on, each with its own data.

There are many ways to find cards. The narrower you scope the request the better, and starting with a Widget is the best way since some Card data is Widget-scoped.

Find all cards on a Widget:

```ts
const cards = await bravoClient.listCardInstances({widgetCommonId: 'the-widget-id'});
// or, if you already have a Widget instance:
const cards = await widget.listCardInstances();
```

Find all instances of a Card using the Card's index (the one shown in the Favro app):

```ts
const cardInstances = await bravoClient.findCardInstancesBySequentialId(1234);
```

Find a single instance of a Card based on its Widget-specific ID:

```ts
const cardInstances = await bravoClient.findCardInstanceByCardId('the-cardId');
```

### Update a Common Field on a Card

All Cards have a handful of built-in fields. You can update these one at a time on a card via a BravoCard instance's helper methods:

```ts
await card.updateName('new name');
await card.updateDescription('new description');
await card.update();
```

### Batch-Update a Card's Common Fields

Update a bunch of fields at the same time to reduce API calls. You can do this by creating a raw update object, or by using an "Update Builder" as a helper to create such an object. You can even re-use an Update Builder instance to update other Cards!

```ts
// Send a raw multi-field update via the Client.
// Your IDE will help you fill this out correctly if
// it supports Typescript!
await bravoClient.updateCardInstanceByCardId('the-card-id', {
  name: 'A new name!',
  detailedDescription: 'A new description!'
});
```

```ts
// Find a user to assign in the batch update
const assignee = await bravoClient.findMemberByName('Scam Likely');

// Use the update-builder to create and send an update
// that covers multiple built-in fields.
const updateBuilder = card.createNewUpdateBuilder();
updateBuilder
  .assign([assignee])
  .setStartDate(new Date())
  .addTagsByName(['todo'])
  .archive();
// Submit the update-builder's changes
await card.update(updateBuilder);
// Update another card the same way
await someOtherCard.update(updateBuilder);
```

### Add a Card Attachment

```ts
// Provide a file name and the raw data
await card.attach('some-data.txt', "Ooooh, a text file!");

// Or, provide a path to a local file to upload
await card.attach('path/to/a/file.txt');
```

### Ensure up-to-date data (clear caches)

Bravo Clients cache data to reduce API calls and improve performance. Caching is always a double-edged sword -- whenever you need to guarantee that the data returned by Bravo reflects exactly what is stored by Favro, you'll want to clear the client's cache.

Cards have their own mechanism to ensure they are up-to-date, since they are the type of entity for which you'll most likely want to ensure that.

```ts
// Clear ALL caches. Only clears the cache for subsequent Bravo method calls.
// (If you have stored some value in a variable it will not necessarily be cleared.)
bravoClient.clearCache();

// Update the local data for a single card
await card.refresh();
```


## The Favro Data Model

The Favro API gives us access to some of the underlying data models used by Favro. While not exactly *unintuitive*, it is tricky to figure out how everything works together and what Favro's terms and names mean.

Below is a summary of how it all comes together.

### Collections

The term "Collection" is used the same way in the webapp and API. A Collection is essentially a dashboard that contains Widgets, and Widgets can live in multiple Collections.

### Widgets (a.k.a. "Boards")

A Favro Board (e.g. a KanBan board or Backlog) is called a "Widget" in the Favro API.

> ⚠ The API does not have any access to the "Views" concept that we can use via the UI (e.g. to create Sheet and Kanban views on the same Board/Widget).

### Columns (a.k.a. "Board Statuses")

A Widget has "Columns", which have a narrower meaning than you might expect: each Column corresponds to one *value* from the "Status" field that is created when you make a new Widget via the GUI. In other words, "Column" and "Status" are interchangeable.

> 💡 Favro's Webhooks are attached to *Columns*: Webhooks only trigger for registered events occurring on their associated Columns.

> ⚠ While the default Status field is synonymous with "Columns", that *is not true* for custom Status fields! Custom Status fields are their own completely separate thing (discussed below).

### Cards

A Card can exist in multiple Widgets at once. Favro models this by saying that a Card is "instanced" separately on each Widget. Cards have multiple identifiers acting differently on the global vs. "instance" scopes:

| Identifier Name | Scope      | Purpose                       |
| --------------- | ---------- | ----------------------------- |
| `cardCommonId`  | Global     | Identifying a Card            |
| `cardId`        | Per Widget | Identifying a Card *instance* |
| `sequentialId`  | Global     | Human-friendly id (for URLs)  |

When you list Cards in a Widget-level scope (e.g. by limiting the search to a specific Widget), you'll get exactly one instance of each returned Card.

When you list Cards in a global-level scope (e.g. by filtering on `sequentialId` or `cardCommonId`, or otherwise not filtering by Widget or forcing uniqueness), you can end up getting multiple near-identical copies of the same Card! One per Widget that the Card is "instanced" on.

Many of the Card's data is completely identical in each instance. Only the Widget-specific data changes, which is largely about position information within the Widget. Example per-Widget Card data (non-exhaustive):

| Card Instance Field | Meaning                                                                                              |
| ------------------- | ---------------------------------------------------------------------------------------------------- |
| `widgetCommonId`    | The parent Widget's ID (for this Card instance)                                                      |
| `columnId`          | The identifier for the Status/Column this instance is in on the parent Widget                        |
| `parentCardId`      | If the card has a parent on the Widget (a la Sheet-view), the parent Card's Widget-specific `cardId` |
| `listPosition`      | The index position of the Card on the Widget                                                         |
| `timeOnBoard`       | How long the Card has been on the Widget                                                             |
| `archived`          | Whether or not the Card is archived on its parent Widget                                             |

> 💡 To get all Board Statuses for a Card, you would need to do a search using a global identifier for that card and then loop through all returned instances.

### Built-In Card Fields

All cards come with a handful of fields by default. These fields are global (not Widget-specific), and include:

- `name`: The title/name of the card (the part you fill in first when making a new one)
- `detailedDescription`: The body of the card, as either Markdown or some sort of sad text file with Markdown removed
- `cardCommonId`: The globally unique identifier for this card
- `tags`: Identifiers for tags used on this card (tags are global)
- `sequentialId`: An incrementing numeric identifier, used for URLs
- `startDate`: The work start-date for the card
- `dueDate`: The work due-date for the card
- `assignments`: Who is assigned, and whether they've marked themselves "complete"
- `attachments`: List of files attached and their URLs
- `customFields`: While this field is on every card, its values depend on what data has been attached to the card via Custom Fields (see below)
- `favroAttachments`: A list of Favro data objects attached to the card (like other cards and Widgets, shown as embeds in the body)

### Custom Fields

> ⚠ Custom Field data from the Favro API cannot be filtered by scope and does not contain scope information, unlike what you see in the Favro UI. This makes working with Custom Fields via the API (and Bravo) difficult. [Upvote the associated Favro Feature request!](https://favro.canny.io/feature-requests/p/webhooks-api-custom-fields-visibilityscope-information)

The idea of "Custom Fields" is a bit confusing, since the Favro GUI doesn't make it clear which fields are built-in, or that the default "Status" field is a totally different kind of thing (a collection of "Columns"). Further, "Custom Fields" overlap many of the built-ins in *type*: you can have a Custom Status Field, or a Custom Members field, and so on.

All fields that are neither the build-ins nor the Widget-specific "Status" (Column) fields are "Custom Fields".

In the GUI you can change a Custom Field's visibility and scope, and when you open a Card GUI you'll see all in-scope (global-, collection-, and widget-specific) Custom Fields shown, even for fields that are not yet set on that specific card. This makes it easy to figure out which field is which when using the app.

When using webhooks or the public API, however, _all custom fields are global_ and they contain no information to help determine their scope. In other words, if any two of your (likely hundreds of) custom fields have the same name, you will not be able to tell them apart in the data returned by the Favro API.

This problem is exacerbated by the facts that:

- Cards can move around to different Widgets, causing them to inherit additional custom fields
- Custom fields can be sparse on a given Widget (only those for which a value is set will be present at all in the API data)

Collectively, these prevent you from using existing Cards (fetched while narrowing the search scope to a specific Widget) to infer what fields are associated with a given Widget.

Currently, the best way to find Custom Field identifiers for use by the Favro API (or Bravo) is to use a browser's dev tools in the web-app. For example, by using the browser's "Inspect element" on a Custom Field shown inside a card, you can find its ID in the HTML element's `id` field.


## Tips, Tricks, and Limitations

Some lessons learned while building Bravo. 

### API Rate Limits

Favro's API rate limits are quite strict and [differ by plan tier](https://www.favro.com/pricing). At the time of writing, based on the pricing page and my experience using the API, the limits appear to be:

| Tier         | Requests/Hour |
| ------------ | ------------- |
| Free (trial) | 100           |
| Lite         | 100           |
| Standard     | 1000          |
| Enterprise   | 10000         |

Rate limits appear to be per user-organization pair. It is easy to hit the lower limits even with fairly light automation.

### Searching

> ⚠ The Favro API has extremely limited search functionality. **[Upvote the feature request!](https://favro.canny.io/feature-requests/p/api-filter-by-field-title-tags-status-custom-fields)**

The Favro API does provide some filtering options, e.g. to restrict the "get Cards" endpoint to a specific Widget, but there is no way to further restrict by any content of the cards themselves (e.g. no text search on the name/description fields, nor filtering by assigned user, nor tags, etc).

To _find_ something via the API then requires an exhaustive search followed by local filtering. Bravo adds some convenience methods for things like finding a card by name, but it does so by doing an exhaustive search behind the scenes.

Bravo does some caching and lazy-loading to reduce the impact of this on the number of API requests it makes, but the end result is always going to be that search functionality in Bravo has to consume a lot of API requests, especially if you have a lot of stuff in Favro.

### Member fields & "completion"

Cards have a default Members field, and also allows for Custom Members fields. You'll notice that, via the Favro webapp, if you click the "Mark as complete" button you'll get a checkmark next to your avatar *in every Members-type field*. (And all will be unchecked if you then mark as incomplete.) But via the API, you mark a user "complete" via the built-in *or* via the Custom Members field.

So what happens when you mark a user as complete via the API, given the combinations of ways a user can be assigned to any subset of the default and any Custom Members fields?

- All Member field "completion" statuses are **completely independent** via the API.
- The Favro webapp will show checkmarks correctly by field -- if you used the API to mark the default field "complete" but not a Custom Field, you'll see the checkmark in the default Members assignment but not the Custom one.
- The Favro webapp will only show the Card as "complete" if *all* Member fields are complete.
- The Favro webapp couples completion state between all fields when you use the "Mark as (in)complete" button.
- If you use the context menu for an individual Member field in the Favro webapp, you can separately manage completion state between fields via the app.
- The Favro API *does not* provide a way for you to obtain a user's "complete" status for a Custom Members field via the API. You can *set* the state but not *get* the state! ([Upvote the feature request!](https://favro.canny.io/feature-requests/p/favro-api-return-complete-state-for-custom-members-fields))


### Limited Markdown

> ⚠ Webhooks do not send Markdown. To get full Markdown content in response to a Webhook, you'll have to fetch the same card again via the API. **[Upvote the feature request!](https://favro.canny.io/bugs/p/webhooks-no-way-to-get-correct-description)**

Favro implements a limited subset of Markdown. Which subset seems to differ based on context (e.g. a Card description vs. a Comment).

Despite having some Markdown support, the API and Webhook data defaults to a "plaintext" format, which apparently means "strip out all Markdown". This is a particular problem for Webhooks, since there is no way to cause them to send Markdown instead.

Bravo defaults to requesting Markdown where that's possible.

### Identifiers

Items in Favro (cards, boards, comments, custom fields, etc.) are all identified by unique identifiers. Different types of items are fetched independently, with relationships indicated by identifiers pointing to other items.

For example, if you fetch a Card from the API (or a webhook) you'll also get a list of Widget identifiers in that card, but not the data about those widgets. Similarly, a Card contains a list of its Custom Fields and corresponding values, but most of the information is in the form of Custom Field identifiers. In both cases, if you wanted to see the _names_ or other information for those associated items, you'll need to make API requests for those specific items using their IDs and appropriate API endpoints.

Bravo tries to handle much of this for you behind the scenes.

#### Card Sequential IDs

Cards have a field called `sequentialId` that corresponds directly to the visible identifier shown in the Card UI, from which users can copy a card URL.

Note that the card-search Favro API endpoint allows use of `sequentialId` as a query parameter. They've done us a huge solid here by allowing us to use any of the following as its value while still serving up the expected card:

- The number part of the identifier shown in the UI.
- The full identifier shown in the UI (e.g. `BSC-123`).
- The full URL of the card copied from the UI.

Note that all of these also appear to work for the user-friendly Card URLs (e.g. where the default URL ends with `?card=BSC-123` you could instead use `?card=123`).

#### Widget-specific `cardId`s

Favro Cards are always return as an *instance* of that Card, each with its own `cardId`.

Despite this ID being Widget-specific, and the existence of global idtentifiers for Cards, most of the Favro API card endpoints use this Widget-scoped `cardId`. Presumably this is to prevent them having to have distinct endpoints for managing global vs. Widget-scoped properties.

### Creating Boards

> 💡 Create boards manually via the app to get all the features you expect from Favro.

When creating a board via the Favro API, there appears to be no way to have the resulting board work the same way as one created via the app. In particular, when creating a Kanban board the columns are not linked to a "Status" type Custom Field and there does not seem to be a way to create such a connection after the fact.There appears to be a [planned fix](https://favro.canny.io/bugs/p/fav-93084-api-created-widget-has-no-synced-status-with-kanban-views).

There is also no way to create views using the Favro API.
