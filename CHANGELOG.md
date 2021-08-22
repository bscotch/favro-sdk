# [0.4.0](https://github.com/bscotch/favro-sdk/compare/v0.3.0...v0.4.0) (2021-08-22)


### Features

* Change the name of the method for finding a card by its cardId to be more precise. ([0e81a9b](https://github.com/bscotch/favro-sdk/commit/0e81a9bd16a828260392578a9f85b54cfe0f8579))



# [0.3.0](https://github.com/bscotch/favro-sdk/compare/v0.2.0...v0.3.0) (2021-08-22)


### Features

* Add Card methods for fetching associated Custom Field definitions and values. ([de0188d](https://github.com/bscotch/favro-sdk/commit/de0188dc06d84f91f3f150deaffcadedc0af589b))
* Add Client method to find a Custom Field by its ID. ([631630e](https://github.com/bscotch/favro-sdk/commit/631630e6f826b69c751d7a3a7418abc5d809011f))



# [0.2.0](https://github.com/bscotch/favro-sdk/compare/v0.1.0...v0.2.0) (2021-08-21)


### Bug Fixes

* The Custom Fields cache is not being cleared during full-cache clear. ([16eed35](https://github.com/bscotch/favro-sdk/commit/16eed35991d062040c6279fc1bdb5d2df191f026))


### Features

* Add general 'findCollection' method to Client ([01b1537](https://github.com/bscotch/favro-sdk/commit/01b1537db47ef1b3516c121c68502e14880eee59))
* Add method to Card instances for fetching associated Custom Field definitions. ([24a3087](https://github.com/bscotch/favro-sdk/commit/24a3087f52ef50f699c4394a2f5156be71260813))
* Add methods to Cards for getting and setting their Column/Status. ([4821578](https://github.com/bscotch/favro-sdk/commit/48215784d9c58252b35f393446359d8da51a0577))
* Change method names for finding organization users, and create aliases in Organization classes. BREAKING ([c84ba50](https://github.com/bscotch/favro-sdk/commit/c84ba50977959da7c56e905bb1b9faf33d6030b4))
* Remove member-finding aliases from Org instances and simplify the names of said methods in the Client. BREAKING ([b3e8a0f](https://github.com/bscotch/favro-sdk/commit/b3e8a0ff62bd2114d6dc1358b38d5e52ac1018b9))
* Rename card methods to refer to Card 'Instances' to be more explicit about what's happening. ([a5aa22e](https://github.com/bscotch/favro-sdk/commit/a5aa22ec4cedee4774a0f2eb7443208aacb6f1b4))
* Require including organizationId when instancing a BravoClient. Allowing setting it later by name makes many things confusing and weird. BREAKING ([e566707](https://github.com/bscotch/favro-sdk/commit/e5667077fb5bc66e84830df4a06e1f4b55b83ee9))
* Update all dependencies and ensure tests pass. ([06a9e78](https://github.com/bscotch/favro-sdk/commit/06a9e789e436294e2b300fa9ce35e239e3b40f89))



# [0.1.0](https://github.com/bscotch/favro-sdk/compare/2d90d6b8e58a72c5f3bd48efe0201f5b58bfaa96...v0.1.0) (2021-08-19)


### Bug Fixes

* An unsaved refactor breaks a method. ([714cc1d](https://github.com/bscotch/favro-sdk/commit/714cc1d1b3ee4024857b1cea261037c04ee1b096))
* Remove legacy function overloads for generic Favro requests. ([ae464db](https://github.com/bscotch/favro-sdk/commit/ae464db0995697386867cac936c27e0be18499bd))
* Resolve type discrepancies between docs and sample Card data. ([80b9743](https://github.com/bscotch/favro-sdk/commit/80b974336a3dc6fdbba69063f0fa45ea582d34e4))
* The body of a request is being parsed from the whole request options object instead of just the body field. ([7931b1f](https://github.com/bscotch/favro-sdk/commit/7931b1ff773d2516fe549bf0dbb83187c424f377))
* The Favro Card Update type does not include null as an option for date fields. ([fb9431b](https://github.com/bscotch/favro-sdk/commit/fb9431b7e8fed38591d870a7472e29bab0fd7071))
* The test configuration in launch.json points to a non-existent test file. ([22c268f](https://github.com/bscotch/favro-sdk/commit/22c268febed8ed82e72a9801c5ed261bc7c1fd88))
* The update builder is not reset after running an update. ([cb74e1b](https://github.com/bscotch/favro-sdk/commit/cb74e1bd882722391cfb1dc5e102c923908c6a78))


### Features

* Add a helper class to make building Favro Card updates easier, plus a method on a BravoCard to update itself using that class or raw data. ([008f7c5](https://github.com/bscotch/favro-sdk/commit/008f7c561a1a0221a970de62cf75da7665772fc8))
* Add a listCollections method and requisite caching. ([65c2126](https://github.com/bscotch/favro-sdk/commit/65c21266a57d7af8ba37979bec36321bab93a49e))
* Add a method to list widgets (obtaining a pageable result). ([d9117d7](https://github.com/bscotch/favro-sdk/commit/d9117d734a73b0cb12f4ccd2a449d0d13f37e723))
* Add a utility type for array-matching functions. ([e427ba2](https://github.com/bscotch/favro-sdk/commit/e427ba2d2609f201a17a378883e2912557dc978e))
* Add caching to Widget Columns. ([956dcd7](https://github.com/bscotch/favro-sdk/commit/956dcd73900b32ab643b245fefdd54f34d3411e4))
* Add Card class. ([5133cb4](https://github.com/bscotch/favro-sdk/commit/5133cb41893c6c585788208112e1882f4ba67f9f))
* Add client methods for fetching, creating, and delting Columns. ([8a6d604](https://github.com/bscotch/favro-sdk/commit/8a6d6048321d637cf73d4a991bb7f6ef6394f400))
* Add column-related partial methods to Widgets and Columns. ([42001de](https://github.com/bscotch/favro-sdk/commit/42001deb9038a575483ae8395617736bf63b7c28))
* Add draft Card types. ([4ba0de9](https://github.com/bscotch/favro-sdk/commit/4ba0de9560e8e874e6a590565f2ac4ac09d8f29e))
* Add draft Column types. ([d0dd315](https://github.com/bscotch/favro-sdk/commit/d0dd315681621deede4b7a8a8395219e6d74f318))
* Add draft Custom Field types (special thanks to regex). ([b93b06e](https://github.com/bscotch/favro-sdk/commit/b93b06e13c185d4d49580280960960d4bbe2f6bf))
* Add draft Tag types. ([65f1f58](https://github.com/bscotch/favro-sdk/commit/65f1f58ecaf47e598dae21f43d883b64bf553812))
* Add draft type for the body content of a Card update. ([f986af1](https://github.com/bscotch/favro-sdk/commit/f986af1cfde9e54bbb019ea659b3f0eaafbf999e))
* Add fetching and caching of custom fields. ([6a29180](https://github.com/bscotch/favro-sdk/commit/6a291804217fab2464aa46415b8d33884478a95f))
* Add find/delete methods for columns in Widget instances. ([3bd307c](https://github.com/bscotch/favro-sdk/commit/3bd307c62b52c50d80a8a3b7445647c2cbbe1d07))
* Add finding cards by their sequentialId (the number shown on the Favro UI on cards). ([621dc8a](https://github.com/bscotch/favro-sdk/commit/621dc8a3df2b7d7d13efb6bc583ee3b7f438e832))
* Add generic client method for finding widget columns. ([2d87d1e](https://github.com/bscotch/favro-sdk/commit/2d87d1eaee26a2584e971894ed521f6784b3dd98))
* Add ignore-case option to the general finder function, and use for finding by name or email. ([b177680](https://github.com/bscotch/favro-sdk/commit/b1776807eb8d379d098aca83ede72b8a9dd2a8c4))
* Add method for fetching a specific card by its cardId. ([561d6a7](https://github.com/bscotch/favro-sdk/commit/561d6a7abd5115a691b9ca2794201fe5ed4d493d))
* Add method for updating a Card with a raw data structure (no helpers for Custom Fields). ([0493403](https://github.com/bscotch/favro-sdk/commit/0493403a916f78e4bf68f452e6aa6dacda10b996))
* Add method to find users by name, id, or email. ([02e79c3](https://github.com/bscotch/favro-sdk/commit/02e79c3c288fa0f532088244b96afcf5fa9e2db9))
* Add methods for creating and deleting Collections, add more classes and types for the disparate kinds of API response data, and improve generic request handling. ([65c49ed](https://github.com/bscotch/favro-sdk/commit/65c49ed74f086c7464a9ec4e1c1e70b725d784ba))
* Add methods for creating, finding, and deleting cards, with passing tests. ([e5bed0c](https://github.com/bscotch/favro-sdk/commit/e5bed0c0f79fd47d4a1e549cd16bf6f78509d671))
* Add methods to find collections by name or ID. ([fd13627](https://github.com/bscotch/favro-sdk/commit/fd13627d7d6fd2fe89736aef283dc881bdc2be7c))
* Add partial methods to the Collection class to allow instances to find their own Widgets. ([8b1883c](https://github.com/bscotch/favro-sdk/commit/8b1883c4cf178522c47dff8aba8133bc511a0477))
* Add types for Card creation and searching. ([82e3e7b](https://github.com/bscotch/favro-sdk/commit/82e3e7ba07e14de70b807ba8488764d1a0f7dd0f))
* Add utility 'find' functions for improved typing and more specific functionality for class 'find' methods. ([344f288](https://github.com/bscotch/favro-sdk/commit/344f288b86f6d61585fea76c6c809e7ee9e5392a))
* Add Widget deletion methods and get all tests passing. ([1c2898a](https://github.com/bscotch/favro-sdk/commit/1c2898ad100f449d530a4bf31f1bab46815ab65d))
* Change basic info in the template CLI scripts (nowhere near functional still). ([d12bab0](https://github.com/bscotch/favro-sdk/commit/d12bab0dc6bbde03b7bfc297828e8efeed0c8227))
* Change finding/deleting Collections by name to be batch methods, since names are not unique in Favro. ([08d8647](https://github.com/bscotch/favro-sdk/commit/08d8647bce8d13c0c86061b4b13bf4c3ccbc3da6))
* Change the find-collection-by-id method to directly hit the single-collection API endpoint if not found in cache. ([53a1a25](https://github.com/bscotch/favro-sdk/commit/53a1a25f707bec4775234009eb1a94506c309fb9))
* Complete types for updating a Card. ([47dbdd9](https://github.com/bscotch/favro-sdk/commit/47dbdd99352564e713284f4751a503234245059f))
* Create a distinct BravoResponse class that can page and hydrate results. ([4ebf40a](https://github.com/bscotch/favro-sdk/commit/4ebf40afa0fc77d8b34d0e8c469086f14a451bf8))
* Draft base BravoClient class, including a method for general Favro API requests and a wrapper class for returned results. ([2d90d6b](https://github.com/bscotch/favro-sdk/commit/2d90d6b8e58a72c5f3bd48efe0201f5b58bfaa96))
* Draft content for dealing with an Integromat Favro app. ([077d9e2](https://github.com/bscotch/favro-sdk/commit/077d9e21dde13e11e8922db22900041f8c9757ff))
* Draft the Column class. ([b2318a7](https://github.com/bscotch/favro-sdk/commit/b2318a760b44b753d75f01e0c0741e827a080bad))
* Get all built-in fields updateable with all tests passing. ([b7582ea](https://github.com/bscotch/favro-sdk/commit/b7582ead90ec789f887a3dec56e2735c6684a908))
* Have all API data wrapped in a class extending a base 'FavroEntity' class, with access to the client. ([546cc98](https://github.com/bscotch/favro-sdk/commit/546cc980e28d1b03d9f5e078a6b93011f6549c2b))
* Have card instances produce user-friendly URLs for linking to cards via the Favro app. ([aeda35d](https://github.com/bscotch/favro-sdk/commit/aeda35d42ce55393fc0d3958e4a2775d2ffdc373))
* Implement methods for listing orgs, setting the current org, and listing org users. ([6f59b1e](https://github.com/bscotch/favro-sdk/commit/6f59b1efc4a4ad182b2488479de5a24b9893ab56))
* Implement uploading card attachments. ([d2319af](https://github.com/bscotch/favro-sdk/commit/d2319af265f9b328d74a3a8c921c6551f00ab98d))
* Move core Favro API functionality into a base 'FavroClient' class to reduce complexity. ([992524a](https://github.com/bscotch/favro-sdk/commit/992524a3f22fe13f4c51a7161579f4d77f175299))
* Prevent the organizationId from being reset once set, since that will complicate literally everything downstream. ([5e3de6d](https://github.com/bscotch/favro-sdk/commit/5e3de6de5df0fdfba9de4cdea338c55af397553a))
* Rename classes to be more consistent between use of 'Bravo' vs. 'Favro' ([6d34319](https://github.com/bscotch/favro-sdk/commit/6d3431985d3a8cb28219ad2e312886f6a74b2d4b))
* Simplify API for Favro response parsing by using async iterators, and add find methods for Widgets. ([111bf17](https://github.com/bscotch/favro-sdk/commit/111bf170b0123fe339c2d793294756ac0ffa0adf))



