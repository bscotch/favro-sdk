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
  - ✔ Set org by name or ID
- Users
  - ✔ List users
  - ✔ Find user by name, id, or email
- Collections
  - ✔ List collections
  - ✔ Find collection by name
  - ✔ Find collection by id
  - ✔ Create a collection
  - ✔ Delete a collection
- Widgets
  - ✔ List widgets
  - ✔ Find widget by ID
  - ✔ Find widgets by name
  - ✔ Create a widget
  - ✔ Delete a widget
- Columns
  - ✔ List columns
  - ✔ Find columns
  - ✔ Create columns
  - ✔ Delete columns
  - 😍 Add some sort of warning when a user tries to delete the LAST column on a Widget, since that's guaranteed to throw a 403.
- Cards
  - 🔜 Create a card
  - 🔜 List cards
  - 🔜 Find card by title or ID
  - 🔜 Delete a card
  - 🔜 Find card by field value (very tricky, requires handling "Custom Fields")
  - 🔜 Add an attachment
- Custom Fields
  - 🔜 Fetch and cache Custom Fields
  - ❓ Create Custom Field
  - ❓ Delete Custom Field
  - ❓ Update a Custom Field
- Comments
  - 🔜 Create a comment
  - 🔜 List comments
  - 🔜 Delete a comment
  - ❓ Update a comment

## Usage

### Dependencies

- [**Node.js v14+**](https://nodejs.org/)

## Development

Env vars:

- `FAVRO_TOKEN`
- `FAVRO_USER_EMAIL`
