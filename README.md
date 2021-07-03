<p align="center"><i><a href="https://www.bscotch.net">Butterscotch Shenanigans</a> Presents:</i></p>

<h1 align="center"> Bravo</h1>
<h2 align="center">The <i>(Unofficial)</i> Node.js SDK for Favro</h2>

[Favro](https://www.favro.com/) is an amazing project management tool
and a great way to centralize all kinds of workflows. Favro provides a
robust HTTP API and webhooks to connect external events and data sources
to Favro Workflows, but raw HTTP APIs are a pain to use. That's what Bravo
is for!

_Butterscotch Shenanigans&reg; and Bravo are not affiliated with Favro._

## Quick Start

`npm install -g @bscotch/bravo`

## Usage

### Client Parameters

As environment variables:

- `FAVRO_TOKEN`
- `FAVRO_USER_EMAIL`
- `FAVRO_ORGANIZATION_ID` (optional, can by found with Bravo)

## Roadmap

| Icon | Meaning                                           |
| ---- | ------------------------------------------------- |
| 🔜   | Planned for core feature set                      |
| ✔    | Complete                                          |
| 😍   | Quality-of-life improvements that _should_ happen |
| ❓   | Maybe... someday... if a use case arises...       |

- BravoClient
  - 😍 Logging utility (with debug flag)
  - 😍 Track request counts and optionally log them (for auditing API use vs. rate limits)
  - 😍 Handle hitting the API rate limit (currently just a 403 error)
- ❓ CLI _(no current use cases)_
- Organizations
  - ✔ List orgs
  - ✔ Find org by name
  - ✔ Set active org by name or ID
  - ❓ Update an org
- Users
  - ✔ List users
  - ✔ Find user by name, id, or email
- Collections
  - ✔ List collections
  - ✔ Find collection by name
  - ✔ Find collection by id
  - ✔ Create a collection
  - ✔ Delete a collection
  - ❓ Update a collection
- Widgets
  - ✔ List widgets
  - ✔ Find widget by ID
  - ✔ Find widgets by name
  - ✔ Create a widget
  - ✔ Delete a widget
  - ❓ Update a widget
- Columns
  - ✔ List columns
  - ✔ Find columns
  - ✔ Create columns
  - ✔ Delete columns
  - 😍 Add some sort of warning when a user tries to delete the LAST column on a Widget, since that's guaranteed to throw a 403.
  - ❓ Update a column
- Cards
  - ✔ Create a card
  - ✔ List cards
  - ✔ Find card by name
  - ✔ Delete a card (from a board or from EVERYWHERE)
  - 🔜 Change field values on a card, including Custom Fields
  - 🔜 Find card by field value, including Custom Fields
  - ❓ Add an attachment
  - ❓ Cache cards to reduce API calls (cards change frequently, so this might be a bad idea anyway)
- Custom Fields
  - ✔ Fetch and cache Custom Field definitions
  - ~~Create Custom Field~~ (No API endpoint for this)
  - ~~Delete Custom Field~~ (No API endpoint for this)
  - ~~Update a Custom Field~~ (No API endpoint for this)
- Comments
  - 🔜 Create a comment
  - 🔜 List comments
  - 🔜 Delete a comment
  - ❓ Update a comment
- ❓ Activities

## Usage

### Dependencies

- [**Node.js v14+**](https://nodejs.org/)

## Development

- `FAVRO_TOKEN`
- `FAVRO_USER_EMAIL`

## Complications

The public Favro API has a limited set of functionality compared to private, websocket-based API used by the official application. In general, it seems that creating all the collections, boards, views, etc (everything but cards) manually via the application will lead to less confusion and limitation.

### Custom Fields

All fields except for the ones every card has (the default Tags and Members fields) are "Custom Fields". In the app you can change a Custom Field's visibility and scope, and cards are shown with all in-scope fields even if those are unset. This makes it easy to figure out which field is which when using the app.

When using webhooks or the public API, however, _all custom fields are global_ and they contain no information to help determine their scope. In other words, if any two of your (likely hundreds of) custom fields have the same name, you will not be able to tell them apart!

This problem is exacerbated by the facts that:

- Cards can move around to different Widgets, causing them to inherit additional custom fields.
- Custom fields can be sparse on a given Widget.

Collectively, these prevent you from using existing Cards (fetched while narrowing the search scope to a specific Widget) to infer what fields are associated with a given Widget.

Identifiers can currently be found by using a browser's dev tools in the web-app. E.g. by using "Inspect element" on an item shown inside a card, you can find its ID in an HTML element's `id` field (among other attribute fields).

[Feature reqeust](https://favro.canny.io/feature-requests/p/webhooks-api-custom-fields-visibilityscope-information)
