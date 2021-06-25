# Contributing <a id="contribute"></a>

We would love to get your contributions to Bravo! This section details our expectations and requirements if you do want to contribute.

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

## Issues and Suggestions

If you discover bugs or missing features, please post them as GitHub issues. Be extremely detailed and thorough in your explanation of the issue/suggestion and why it's important to address it.

Note that it will not be a high priority for the Bscotch team to address issues and feature that we ourselves don't actively need. To make your own fixes/features, see the next section.

## Contributing Code

The fastest way to get fixes and features into Bravo is to submit them yourself! By forking this repo and making changes, you can have your own version of Bravo that works however you want.

If you want to bring your changes back into the main Bravo repo, you can make a pull request to do so. Note that your code will be under strict requirements to make sure that things don't turn into spaghetti:

+ Code must be fully typed Typescript (no `as any` or `//@ts-ignore` unless absolutely necessary).
+ If adding a similar feature to something that already exists, the code must follow a similar pattern and re-use as much existing code as possible (no DRY violations).
+ Names of variables, methods, etc. must be consistent with those already in the project.
+ There must be test cases that cover your changes/additions (see `src/test/index.ts`). We don't require unit tests, just functional tests.
+ The pull request must be git-rebase-able on the HEAD of the `develop` branch without conflict.
+ Commit messages must follow the project conventions (below).

It is likely that we will ask for minor changes to the code before accepting a pull request, to ensure that the code base stays consistent.

## Code Layout

Here's a high-level overview of how this project is set up so that you can
figure out where to make your changes:

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
  + Run `npm run build`
  + Run `npm test`
+ If all tests are passing, you're good to go!

## How to test your code

In the terminal, run: `npm test`