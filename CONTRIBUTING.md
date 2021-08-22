# Contributing <a id="contribute"></a>

We would love to get your contributions to Bravo! You can help us out by proving bug reports and feature requests, or by submitting Pull Requests with changes you've made.

This doc details our expectations and requirements if you do want to contribute.

## What we're looking for

Since we only implement features needed by our own team, any missing features that are useful to the broader Favro community are excellent targets for help.

Otherwise, we're mostly looking for features that make it as easy as possible to use Bravo and to, in turn, make it as easy as possible to use the Favro API. Any features that add some syntactic sugar, or make hydrated data structures more functional, or that otherwise allow for more functionality with less code, are all welcome!

Of course, getting rid of bugs is always a good thing.

### Check in first!

If you want to contribute a feature or fix, please first [submit an Issue](https://github.com/bscotch/favro-sdk/issues)! That will let you get some early feedback on what it is you're trying to do.

Whether you check in first or not, we cannot guarantee that your pull request will be accepted. To maximize the likelihood that we *do* accept your PR, please follow the guidelines in this doc.

## Issues and Suggestions

If you discover bugs or missing features, please post them as [GitHub Issues](https://github.com/bscotch/favro-sdk/issues). Be extremely detailed and thorough in your explanation of the issue/suggestion and why it's important to address it.

> ‼ Note that it will not be a high priority for the Bscotch team to address issues and feature that we ourselves don't actively need. To make your own fixes/features, see the next section.

## Commit conventions

All of your commits must follow the conventions below.
We recommend squashing your commits into one commit per
feature/bugfix, but that isn't required.

We follow the conventional-changelog Angular convention for commit messages,
namely formatting them as `<type>: <subject>` where `type` is one of:

+ deps: Dependency update
+ feat: A new feature
+ fix: A bug fix
+ refactor: A code change that neither fixes a bug nor adds a feature
+ test: Adding missing or correcting existing tests
+ docs: Documentation only changes
+ perf: A code change that improves performance
+ chore: Changes to the build process or auxiliary tools and libraries such as documentation generation

## Test Environment Setup

Testing Bravo requires that it have access to a real Favro Organization,
and that the tester/developer do some initial setup. See the root test
file for instructions ([`src/test/client.test.ts`](src/test/client.test.ts)).

## Contributing Code

The fastest way to get fixes and features into Bravo is to submit them yourself! By forking this repo and making changes, you can have your own version of Bravo that works however you want.

If you want to bring your changes back into the main Bravo repo, you can make a pull request to do so. Note that your code will be under strict requirements to make sure that things don't turn into spaghetti:

+ Code must be fully typed Typescript (no `as any` or `//@ts-ignore` unless absolutely necessary).
+ If adding a similar feature to something that already exists, the code must follow a similar pattern and re-use as much existing code as possible (minimal DRY violations).
+ Names of variables, methods, etc. must be consistent with those already in the project.
+ There must be test cases that cover your changes/additions (see `src/test/`). We don't require unit tests, just functional tests.
+ The pull request must be git-rebase-able on the HEAD of the `develop` branch without conflict.
+ Commit messages must follow the project conventions (below).

It is likely that we will ask for minor changes to the code before accepting a pull request to ensure that the code base stays consistent.

## Project Overview

Here's a high-level overview of how this project is set up so that you can figure out where to make your changes:

+ `src/` contains all Typescript source code
+ `build/` will contain all build code, if you make local builds using the Typescript compiler
+ `samples/` contains sample content for tests
+ `src/index.ts` is the entry point for the project. It could be changed to export more types and features.
+ `src/test/index.ts` is the entry point for testing.
+ `src/lib/` is the bulk of where all functionality is coded
+ `src/cli` is where CLI-specific code lives

## Setting up your development environment

After forking this repo to your own GitHub account
and cloning locally:

+ Open a terminal in the root of this project.
  + Run `npm install`
  + Follow test setup instructions in `src/test/client.test.ts`
  + Run `npm test`
+ If all tests are passing, you're good to go!
