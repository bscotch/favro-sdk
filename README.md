<p align="center"><i><a href="https://www.bscotch.net">Butterscotch Shenanigans</a> Presents:</i></p>

<h1 align="center"> Bravo</h1>
<h2 align="center">The <i>(unofficial)</i> Favro SDK</h2>

> **⚠Warning⚠** *Bravo is in active development and may change substantially with any release. Check the changelog before updating!* 

_[Butterscotch Shenanigans&reg;](https://www.bscotch.net) and Bravo (this project) are not affiliated with Favro._

### Features

- 💧 Favro data is hydrated into feature-rich and explorable classes, with convenience functions galore
- 🤖 Fully typed (with Typescript) so your IDE can do tons of the work for you
- ⚡ All core methods are available from the Bravo Client class. Widget, Card, and other hydrated classes provide simplified shortcuts to those same methods, with details already filled in for you.
- 🔐 Credentials and Favro-specific request details handled automatically
- 💤 Lazy-loading of search results to minimize API calls

See the [Roadmap](./ROADMAP.md) for which Favro API features are implemented, planned, or backburnered.

### Why?

[Favro](https://www.favro.com/) is an amazing project management tool
and a great way to centralize all kinds of workflows. However, Favro's integrations with external tools and services, and its own internal automations, are limited.

Fortunately, Favro provides an [HTTP API and Webhooks](https://favro.com/developer) so developers can fill in those gaps themselves. Unfortunately, using raw HTTP APIs is unpleasant and time-consuming. That's where Bravo comes in!

## Quick Start

Install [from npm](https://www.npmjs.com/package/@bscotch/bravo):

`npm install -g @bscotch/bravo`

Then import Bravo into your Node project, instance a Bravo client, and you're all set!

```ts
// ESM-style (Typescript)
import {BravoClient} from '@bscotch/bravo';
// -or-
// CommonJS style (regular Node)
const {BravoClient} = require('@bscotch/bravo');

const bravoClient = new BravoClient({
  token:'your-token',
  userEmail: 'your-favro-account-email',
  // You can set the organizationId later instead!
  organizationId:'your-organization-id',
});

async function doFavroStuff() {
  // Set the organization if you did not provide that
  // to the client already.
  await bravoClient.setOrganizationIdByName('My Organization');
  
  // Find a Widget (a.k.a. Board)
  const widget = await bravoClient.findWidgetByName('My To Do List');

  // Add a card to that widget
  const newCard = await widget.createCard({
    name: 'Talk to so-and-so',
    detailedDescription: 'We need to maximize synergy.'
  });

  // Find the userId for an assignee
  const assignee = await bravoClient.findUserByName('Scam Likely');

  // Use the update-builder to create and send an update
  // that covers multiple fields.
  newCard.updateBuilder
    .assign([assignee.userId])
    .setStartDate(new Date())
    .addTagsByName(['todo']);
  // Submit and clear the update-builder's changes
  await newCard.update();

  // Add an attachment
  await newCard.attach('some-data.txt', "Ooooh, a text file!");
  // If no data is provided, treats the path as an actual
  // file and uploads its contents
  await newCard.attach('path/to/a/file.txt');

  // Delete the card
  await newCard.delete();
}
```

## Authentication

To have Bravo access Favro on your behalf, you'll need to provide it with the credentials listed below. You can do so via environment variables as shown here, or directly when instancing the Bravo client as shown in the example above:

1. `FAVRO_TOKEN`: (required) Your Favro API token. To create one, go to your Profile, then "API Tokens" &rarr; "New API Token".
2. `FAVRO_USER_EMAIL`: (required) Your Favro account email.
3. `FAVRO_ORGANIZATION_ID`: (optional) The Organization ID that you are targeting. You can either provide this directly, or use one of the Bravo client methods to find it (e.g. as in the code example above, using `await bravoClient.setOrganizationIdByName('My Organization')`). You can get your Organization ID from the URL when using Favro in a browser: Favro URLs look like this: `favro.com/organization/{organizationId}`.

> ⚠ The `organizationId` is required for most Favro API calls. To prevent confusion, once you've set the `organizationId` on a Bravo Client instance you cannot change it. You can always create a new instance that talks to a different organization!

## Dependencies

- [**Node.js v14+**](https://nodejs.org/)
- ⚠ Does not work in browser environments!

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

The idea of "Custom Fields" is a bit confusing, since the Favro GUI doesn't make it clear which fields are built-in, or that the default "Status" field is a totally different kind of thing (a collection of "Columns"). Further, "Custom Fields" overlap many of the built-ins in *type*: you can have a Custom Status Field, or a Custom Members field, and so on.

All fields that are neither the build-ins nor the Widget-specific "Status" (Column) fields are "Custom Fields".

In the GUI you can change a Custom Field's visibility and scope, and when you open a Card GUI you'll see all in-scope (global-, collection-, and widget-specific) Custom Fields shown, even for fields that are not yet set on that specific card. This makes it easy to figure out which field is which when using the app.

When using webhooks or the public API, however, _all custom fields are global_ and they contain no information to help determine their scope. In other words, if any two of your (likely hundreds of) custom fields have the same name, you will not be able to tell them apart in the data returned by the Favro API.

This problem is exacerbated by the facts that:

- Cards can move around to different Widgets, causing them to inherit additional custom fields
- Custom fields can be sparse on a given Widget (only those for which a value is set will be present at all in the API data)

Collectively, these prevent you from using existing Cards (fetched while narrowing the search scope to a specific Widget) to infer what fields are associated with a given Widget.

Currently, the best way to find Custom Field identifiers for use by the Favro API (or Bravo) is to use a browser's dev tools in the web-app. For example, by using the browser's "Inspect element" on a Custom Field shown inside a card, you can find its ID in the HTML element's `id` field.

[Upvote the associated Favro Feature request!](https://favro.canny.io/feature-requests/p/webhooks-api-custom-fields-visibilityscope-information)

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

### Creating Boards

> 💡 Create boards manually via the app to get all the features you expect from Favro.

When creating a board via the Favro API, there appears to be no way to have the resulting board work the same way as one created via the app. In particular, when creating a Kanban board the columns are not linked to a "Status" type Custom Field and there does not seem to be a way to create such a connection after the fact.There appears to be a [planned fix](https://favro.canny.io/bugs/p/fav-93084-api-created-widget-has-no-synced-status-with-kanban-views).

There is also no way to create views using the Favro API.
