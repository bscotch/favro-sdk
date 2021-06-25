<p align="center"><i><a href="https://www.bscotch.net">Butterscotch Shenanigans</a> Presents:</i></p>

<h1 align="center"> Bravo: The (unofficial) Node.js SDK for Favro</h1>

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
- `FAVRO_ORGANIZATION_ID`
- `FAVRO_USER_EMAIL`

## TODO

- Class representing a Favro Client, connecting to a single workspace with an API token
  - Methods
    - ✔ List orgs
    - ✔ Find org by name
    - ✔ Set org by name or ID
    - ✔ List users
    - ✔ Find user by name, id, or email
    - List collections
    - Find collection by name
    - Find collection by id
    - Create a collection
    - Delete a collection
    - List widgets
    - Find widgets by name
    - Create a widget

## Usage

### Dependencies

- [**Node.js v14+**](https://nodejs.org/)
