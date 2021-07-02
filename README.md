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

## TODO

- ✔ Client classes
- ✔ Separate request methods for those that
  return hydratable entities and those that
  do not.
- ✔ Method for paging & hydrating search results
- ✔ List orgs
- ✔ Find org by name
- ✔ Set org by name or ID
- ✔ List users
- ✔ Find user by name, id, or email
- ✔ List collections
- ✔ Find collection by name
- ✔ Find collection by id
- ✔ Create a collection
- ✔ Delete a collection
- ✔ List widgets
- ✔ Find widget by ID
- ✔ Find widgets by name
- ✔ Create a widget
- ✔ Delete a widget
- List cards
- Search cards by title
- Create a card
- Delete a card
- Make all tests _self-contained_ (e.g. create a board, _then_ add widgets and cards, etc)

## Usage

### Dependencies

- [**Node.js v14+**](https://nodejs.org/)

## Development

Env vars:

- `FAVRO_TOKEN`
- `FAVRO_USER_EMAIL`
