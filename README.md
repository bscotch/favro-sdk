<p align="center"><i><a href="https://www.bscotch.net">Butterscotch Shenanigans</a> Presents:</i></p>

<h1 align="center"> Bravo</h1>
<h2 align="center">The <i>(Unofficial)</i> Favro SDK</h2>

Bravo makes working with the Favro API a breeze.

### Features

- 💧 Favro data is hydrated into feature-rich and explorable classes, with convenience functions galore
- 🤖 Fully typed (with Typescript) so your IDE can do tons of the work for you
- 🔐 Credentials and Favro-specific request details handled automatically
- 💤 Lazy-loading of search results to minimize API calls

See the [Roadmap](./ROADMAP.md) for which Favro API features are implemented, planned, or backburnered.

### Why?

[Favro](https://www.favro.com/) is an amazing project management tool
and a great way to centralize all kinds of workflows. However, Favro's integrations with external tools and services, and its own internal automations, are limited.

Fortunately, Favro provides an [HTTP API and Webhooks](https://favro.com/developer) so developers can fill in those gaps themselves. Unfortunately, using raw HTTP APIs is unpleasant and time-consuming. That's where Bravo comes in!

_Butterscotch Shenanigans&reg; and Bravo are not affiliated with Favro._


## Quick Start

Install [from npm](https://www.npmjs.com/package/@bscotch/bravo):

`npm install -g @bscotch/bravo`

Import into your Node project, create a Bravo client, and you're all set!

```ts
// Typescript
import {BravoClient} from '@bscotch/bravo';
// -or-
// Node (without Typescript)
const {BravoClient} = require('@bscotch/bravo');

const bravo = new BravoClient({
  token:'your-token',
  organizationId:'your-organization-id',
  userEmail: 'your-favro-account-email'
});

async function doFavroStuff() {
  // Set the organization if you did not provide that
  // to the client already.
  bravo.setOrganizationIdByName('My Organization');
  
  // Find a Widget (a.k.a. Board)
  const widget = await bravo.findWidgetByName('My To Do List');
  // Add a card to that widget
  const newCard = await widget.createCard({
    name: 'Talk to so-and-so',
    detailedDescription: 'We need to maximize synergy.'
  });
  // Find the userId for an assignee
  const assignee = await bravo.findUserByName('Scam Likely');
  // Begin building an update (for batching changes)
  newCard.updateBuilder
    .assign([assignee.userId])
    .setStartDate(new Date())
    .addTagsByName(['todo']);
  // Submit the batch update
  await newCard.update();

  // Delete the card
  await newCard.delete();
}
```

## Authentication

To have Bravo access Favro on your behalf, you'll need to provide it with the values listed below (either as environment variables or directly to the Bravo client):

1. **API Token** (env var `FAVRO_TOKEN`)

## Usage

### Client Parameters

As environment variables:

- `FAVRO_TOKEN`
- `FAVRO_USER_EMAIL`
- `FAVRO_ORGANIZATION_ID` (optional, can by found with Bravo)

## Usage

### Dependencies

- [**Node.js v14+**](https://nodejs.org/)

## Development

- `FAVRO_TOKEN`
- `FAVRO_USER_EMAIL`

## Tips, Tricks, and Limitations

The public Favro API has a limited set of functionality compared to private, websocket-based API used by the official application. There are certain things you can only do via the app, and others that you _should_ only do via the app.

This section provides guidance for using the Favro API (and therefore Bravo), including explanations for what _cannot_ be done with it. I've provided links to feature request/bug reports to the Favro team where appropriate -- please upvote those to let their team know these features/fixes are worth making!

### Searching

> ⚠ The Favro API has extremely limited search functionality. **[Upvote the feature request!](https://favro.canny.io/feature-requests/p/api-filter-by-field-title-tags-status-custom-fields)**

The Favro API has very limited search functionality. It does provide some filtering options, e.g. to restrict the "get Cards" endpoint to a specific Widget, but there is no way to further restrict by any content of the cards themselves (e.g. no text search on the name/description fields, nor filtering by assigned user, nor tags, etc).

To _find_ something via the API then requires an exhaustive search followed by local filtering. Bravo adds some convenience methods for things like finding a card by name, but it does so by doing this sort of exhaustive search behind the scenes. Bravo also does a lot of caching and lazy-loading to reduce the impact of this on the number of API requests it makes, but the end result is always going to be that search functionality in Bravo has to consume a lot of API requests, especially if you have a lot of stuff in Favro.

### Markdown

> ⚠ Webhooks do not send Markdown. **[Upvote the feature request!](https://favro.canny.io/bugs/p/webhooks-no-way-to-get-correct-description)**

Favro implements a limited subset of Markdown. Which subset seems to differ based on context (e.g. a Card description vs. a Comment), though I don't know all the differences. Despite having some Markdown support, the API and Webhook data typically defaults to a "plaintext" format, which apparently means "strip out all Markdown". You may have to plan functionality around such limits.

### Identifiers

> 💡 Use HTML inspectors in the Favro webapp to find unique identifiers.

Items in Favro (cards, boards, comments, custom fields, etc.) are all identified by unique identifiers. Different types of items are fetched independently, with relationships indicated by identifiers for other types of items.

For example, if you fetch a Card from the API (or a webhook) you'll also get a list of Widget identifiers in that card, but not the data about those widgets. Similarly, a Card contains a list of its Custom Fields and corresponding values, but most of the information is in the form of Custom Field identifiers. In both cases, if you wanted to see the _names_ or other information those associated items, you'll need to make API requests for those specific items using their IDs.

You'll find that some items have multiple unique identifiers. Cards, in particular, have a `cardId` and `cardCommonId`. The former is a unique identifier for that Card _on a specific Widget_. The latter is a global identifier for that card.

#### Card Sequential

Cards have a field called `sequentialId` that corresponds directly to the visible identifier shown in the Card UI, from which users can copy a card URL.

Note that the card-search Favro API endpoint allows use of `sequentialId` as a query parameter. They've done us a huge solid here by allowing us to use any of the following as its value while still serving up the expected card:

- The number part of the identifier shown in the UI.
- The full identifier shown in the UI (e.g. `BSC-123`).
- The full URL of the card copied from the UI.

### Custom Fields

> ⚠ There is no way to programmatically differentiate Custom Fields via the Favro API. **[Upvote the feature request!](https://favro.canny.io/feature-requests/p/webhooks-api-custom-fields-visibilityscope-information)**

All fields except for the ones every card has (the default Tags and Members fields) are "Custom Fields". In the app you can change a Custom Field's visibility and scope, and cards are shown with all in-scope fields even if those are unset. This makes it easy to figure out which field is which when using the app.

When using webhooks or the public API, however, _all custom fields are global_ and they contain no information to help determine their scope. In other words, if any two of your (likely hundreds of) custom fields have the same name, you will not be able to tell them apart!

This problem is exacerbated by the facts that:

- Cards can move around to different Widgets, causing them to inherit additional custom fields.
- Custom fields can be sparse on a given Widget.

Collectively, these prevent you from using existing Cards (fetched while narrowing the search scope to a specific Widget) to infer what fields are associated with a given Widget.

Identifiers can currently be found by using a browser's dev tools in the web-app. E.g. by using "Inspect element" on an item shown inside a card, you can find its ID in an HTML element's `id` field (among other attribute fields).

[Feature request](https://favro.canny.io/feature-requests/p/webhooks-api-custom-fields-visibilityscope-information)

### Creating Boards

> 💡 Create boards manually via the app to get all the features you expect from Favro.

When creating a board via the Favro API, there appears to be no way to have the resulting board work the same way as one created via the app. In particular, when creating a Kanban board the columns are not linked to a "Status" type Custom Field and there does not seem to be a way to create such a connection after the fact.There appears to be a [planned fix](https://favro.canny.io/bugs/p/fav-93084-api-created-widget-has-no-synced-status-with-kanban-views).

There is also no way to create views using the Favro API.
