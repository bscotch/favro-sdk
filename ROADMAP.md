## Bravo Roadmap

### General TODO

- Add 
- Revisit "Custom Fields" implementation to make sure it reflects how Custom Fields are used.

### User Stories

The things that we (Bscotch) want to enable via Bravo.

- Find a card on a board by name, and update any of its Custom Status Fields to a different value (matching by *name*).
  - Custom Fields are GLOBAL in the API, and there is no way to filter them by board. Thus we need to be able to fetch a SAMPLE card from a board (probably offline) and then use that as a reference to get the relevant Custom Field IDs.
  - 

### Feature List


| Icon | Meaning                                 |
| ---- | --------------------------------------- |
| 🔜    | Planned for core feature set            |
| ✔    | Complete                                |
| 😍    | Quality-of-life improvements (optional) |
| 🔥    | On the backburner (no use case)         |

Ordered hierarchically by the Favro data model (not by priority order):

- BravoClient
  - 😍 Logging utility (with debug flag)
  - 😍 Track request counts and optionally log them (for auditing API use vs. rate limits)
  - 😍 Handle hitting the API rate limit (currently just a 403 error)
- 🔥 CLI _(no current use cases)_
- Organizations
  - ✔ List orgs
  - ✔ Find org by name
  - ✔ Set active org by name or ID
  - 🔥 Update an org
- Users
  - ✔ List users
  - ✔ Find user by name, id, or email
- Collections
  - ✔ List collections
  - ✔ Find collection by name
  - ✔ Find collection by id
  - ✔ Create a collection
  - ✔ Delete a collection
  - 🔥 Update a collection
- Widgets
  - ✔ List widgets
  - ✔ Find widget by ID
  - ✔ Find widgets by name
  - ✔ Create a widget
  - ✔ Delete a widget
  - 🔥 Update a widget
- Columns
  - ✔ List columns
  - ✔ Find columns
  - ✔ Create columns
  - ✔ Delete columns
  - 😍 Add some sort of warning when a user tries to delete the LAST column on a Widget, since that's guaranteed to throw a 403.
  - 🔥 Update a column
- Cards
  - ✔ Create a card
  - ✔ List cards
  - ✔ Find card by name
  - ✔ Delete a card (from a board or from EVERYWHERE)
  - ✔ Fetch a Card directly by its ID
  - ✔ Fetch a Card directly by its user-visible "sequential ID"
  - ✔ Compose a card URL
  - ✔ Update a Card's built-in fields
  - ✔ Add an attachment to a card
  - 🔜 Update a Card's Custom Fields
  - 🔥 Find card by field value, including Custom Fields
  - 🔥 Cache cards to reduce API calls (cards change frequently, so this might be a bad idea anyway)
- Custom Fields
  - ✔ Fetch and cache Custom Field definitions
  - Add Card method to return hydrated Custom Field Definitions and Custom Field Values
  - ~~Create Custom Field~~ (No API endpoint for this)
  - ~~Delete Custom Field~~ (No API endpoint for this)
  - ~~Update a Custom Field~~ (No API endpoint for this)
- Comments
  - 🔜 Create a comment
  - 🔜 List comments
  - 🔜 Delete a comment
  - 🔜 Add an attachment to a comment
  - 🔥 Update a comment
- 🔥 Activities
