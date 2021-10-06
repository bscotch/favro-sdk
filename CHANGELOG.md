# [2.2.0](https://github.com/bscotch/favro-sdk/compare/v2.1.2...v2.2.0) (2021-10-06)


### Features

* Add NODE_DEBUG-style logging to Favro API requests, allowing devs to opt into a ton of info for triangulating request issues. ([04e047f](https://github.com/bscotch/favro-sdk/commit/04e047f5cb1da4bb1d26a4f55677b5ffab29d44f))



## [2.1.2](https://github.com/bscotch/favro-sdk/compare/v2.1.1...v2.1.2) (2021-10-06)


### Bug Fixes

* Card searches can use the 'cardSequentialId' as a search param, but that value can be provided in multiple formats and the Favro API doesn't always play nice. The value should be normalized to the numeric identifier. ([c2d6db0](https://github.com/bscotch/favro-sdk/commit/c2d6db09b0fd6bbfe1e691c30cb915b945f53787))



## [2.1.1](https://github.com/bscotch/favro-sdk/compare/v2.1.0...v2.1.1) (2021-10-05)


### Features

* Improve handling of rate limit monitoring, since it doesn't ([bc72c29](https://github.com/bscotch/favro-sdk/commit/bc72c29f59415ebd4435e98a58788ce303948614))



# [2.1.0](https://github.com/bscotch/favro-sdk/compare/v2.0.2...v2.1.0) (2021-10-04)


### Features

* Add client and BravoGroup methods for creating, updating, and deleting Groups, with tests. ([c2dd9f3](https://github.com/bscotch/favro-sdk/commit/c2dd9f32001cb83777b3963fe6f410f2455c8a4e))



## [2.0.2](https://github.com/bscotch/favro-sdk/compare/v2.0.1...v2.0.2) (2021-10-04)



## [2.0.1](https://github.com/bscotch/favro-sdk/compare/v2.0.0...v2.0.1) (2021-10-02)


### Bug Fixes

* The types used by the Card Update builder are broken for array fields, resulting in everything being the 'any' type. ([c140250](https://github.com/bscotch/favro-sdk/commit/c140250485667cf87c23b5d5b9bea79f8117ee0a))



# [2.0.0](https://github.com/bscotch/favro-sdk/compare/v1.8.1...v2.0.0) (2021-10-01)


### Features

* Change the method for finding cards by sequential ID to return an already-awaited list, and to allow limiting to one returned value. BREAKING ([ea565df](https://github.com/bscotch/favro-sdk/commit/ea565df59becf793e0e1afbefbfb0c1175013f5b))



## [1.8.1](https://github.com/bscotch/favro-sdk/compare/v1.8.0...v1.8.1) (2021-09-27)


### Bug Fixes

* Requests with 'undefined' values in query params send 'undefined' as a string, breaking some requests. ([7e69623](https://github.com/bscotch/favro-sdk/commit/7e696236a55bdb5b196c1338bc6435f0e47348b4))



# [1.8.0](https://github.com/bscotch/favro-sdk/compare/v1.7.0...v1.8.0) (2021-09-27)


### Features

* Allow for custom Error classes and logging utilities to be used by BravoClient instances. ([fe06ceb](https://github.com/bscotch/favro-sdk/commit/fe06cebdf7fd111b743262ff91efdb1399ef0343))



# [1.7.0](https://github.com/bscotch/favro-sdk/compare/v1.6.0...v1.7.0) (2021-09-27)


### Features

* Add overload to allow finding a column given only its ID, for cases where we have that but not the Widget the column comes from. ([0e1681b](https://github.com/bscotch/favro-sdk/commit/0e1681b1d1d42b8e8f0803259a7472c4b284d47d))



# [1.6.0](https://github.com/bscotch/favro-sdk/compare/v1.5.0...v1.6.0) (2021-09-27)


### Features

* Change the listGroups method to return an already-fully-listed array, since there aren't likely to be a ton of groups in an org. ([959c110](https://github.com/bscotch/favro-sdk/commit/959c11021db3a83d5f5a19ece54771e084c0214e))



# [1.5.0](https://github.com/bscotch/favro-sdk/compare/v1.4.0...v1.5.0) (2021-09-27)


### Features

* Add methods for listing and finding member Groups. ([b2da2d0](https://github.com/bscotch/favro-sdk/commit/b2da2d033df8fba11e66273240a66dafe866e6b1))



# [1.4.0](https://github.com/bscotch/favro-sdk/compare/v1.3.0...v1.4.0) (2021-09-23)


### Features

* Allow new webhooks to be created with automatic secret generation. ([372ae73](https://github.com/bscotch/favro-sdk/commit/372ae7366bf358b25a7cab54607a889e90f6c7bf))



# [1.3.0](https://github.com/bscotch/favro-sdk/compare/v1.2.0...v1.3.0) (2021-09-23)


### Features

* Add a BravoWebhook class, with corresponding methods and tests. ([dfa64f6](https://github.com/bscotch/favro-sdk/commit/dfa64f6138fba6692a2be81236ead759e42ebaf3))
* Add export of BravoEntity types in the entryfile, so that they're more accessible. ([ab834c1](https://github.com/bscotch/favro-sdk/commit/ab834c18fa25de84f0fc6f1eb03b2da1f978b135))



# [1.2.0](https://github.com/bscotch/favro-sdk/compare/v1.1.0...v1.2.0) (2021-09-18)


### Features

* Allow using a custom node-fetch-compatible module for making requests. ([f6034e9](https://github.com/bscotch/favro-sdk/commit/f6034e940e1107facef9a392efc39b36fbbc7a21))



# [1.1.0](https://github.com/bscotch/favro-sdk/compare/v1.0.2...v1.1.0) (2021-08-30)


### Features

* Add Comment types to the FavroApi typings. ([6d808ed](https://github.com/bscotch/favro-sdk/commit/6d808edd3ca0f36bc82989d8c9dfa940357cc909))
* Add full Webhook typings. ([8c77de3](https://github.com/bscotch/favro-sdk/commit/8c77de3c7c36de05de01191636ef39092c4c8a66))



## [1.0.2](https://github.com/bscotch/favro-sdk/compare/v1.0.1...v1.0.2) (2021-08-29)



## [1.0.1](https://github.com/bscotch/favro-sdk/compare/v1.0.0...v1.0.1) (2021-08-29)


### Bug Fixes

* The FavroApi typings import paths are being exported incorrectly, breaking types in the build. ([4cb3734](https://github.com/bscotch/favro-sdk/commit/4cb373441f888c584387714288bea782ddaa9afd))



# [1.0.0](https://github.com/bscotch/favro-sdk/compare/v0.9.0...v1.0.0) (2021-08-29)


### Features

* Completely redo all Favro Api types into the FavroApi namespace. ([076f992](https://github.com/bscotch/favro-sdk/commit/076f992d28acf653568ead229d329edc1831027e))



# [0.9.0](https://github.com/bscotch/favro-sdk/compare/v0.8.0...v0.9.0) (2021-08-29)


### Features

* Continue reorganizting and renaming Favro API data types into namespaced structures. ([e28bad5](https://github.com/bscotch/favro-sdk/commit/e28bad574c7c1cc34f931db276834b1540366a52))
* Reorganize and rename core Favro API typings using namespaces to keep things from polluting global scope. BREAKING ([a08beb5](https://github.com/bscotch/favro-sdk/commit/a08beb52c116891f7136018e1a7df580ebf8f332))
* Reorganize Column typings into the FavroApi namespace. BREAKING ([eaa0a43](https://github.com/bscotch/favro-sdk/commit/eaa0a43f16320b8048b767fc333bd5105da66692))
* Restructure Widget types into the new namespaced FavroApi typings. BREAKING ([ff78d1a](https://github.com/bscotch/favro-sdk/commit/ff78d1a3e24bddfdea4f100d816268736435cff3))



# [0.8.0](https://github.com/bscotch/favro-sdk/compare/v0.7.0...v0.8.0) (2021-08-28)


### Features

* Add new importsNotUsedAsValues field to tsconfig to make it easy to catch imports that should be type-imports, and fix all discovered errors. ([84f07d6](https://github.com/bscotch/favro-sdk/commit/84f07d67d6722d9b6f2975497b84c49c84b62cbe))
* Add Tag management methods to the Client and improve related methods on Cards. BREAKING ([4f364e5](https://github.com/bscotch/favro-sdk/commit/4f364e585bd4bdbeb0a0287d48c4e7c29cf94597))



# [0.7.0](https://github.com/bscotch/favro-sdk/compare/v0.6.0...v0.7.0) (2021-08-28)


### Features

* Add methods for setting Custom Members fields. ([24af17d](https://github.com/bscotch/favro-sdk/commit/24af17d1d1c1d27ce82b97365194d3c453b4f2ec))



# [0.6.0](https://github.com/bscotch/favro-sdk/compare/v0.5.0...v0.6.0) (2021-08-27)


### Features

* Add setter methods for Custom Multiple Select fields. Also rename Single Select methods. BREAKING ([30cd60b](https://github.com/bscotch/favro-sdk/commit/30cd60b327aa4af04a4109a91b80280d5bbc0d65))



# [0.5.0](https://github.com/bscotch/favro-sdk/compare/v0.4.0...v0.5.0) (2021-08-26)


### Bug Fixes

* Setting and checking Custom Status ('Single Select') fields yields errors. ([d34b2b6](https://github.com/bscotch/favro-sdk/commit/d34b2b67ff49032ea252a2d401d481c9ca735996))
* The caching mechanism for searching an entity response array by ID is storing the wrong values. ([223ad66](https://github.com/bscotch/favro-sdk/commit/223ad669eb0ebb1b011380bfbe8da01092b778dc))


### Features

* Add Custom Field setters for Text, Votes, Ratings, Numbers, ([e854e97](https://github.com/bscotch/favro-sdk/commit/e854e972166abffef3d5212d45fa82fd9f09aa6e))
* Add methods for all common-field upates to Card instances. ([0e51f9b](https://github.com/bscotch/favro-sdk/commit/0e51f9bbd462ec302f011420576c09065b675c13))
* Add methods to simplify allowing other method arguments to be supplied as class instances or raw strings. ([a14ee8e](https://github.com/bscotch/favro-sdk/commit/a14ee8ead92489416e7ac26472710d21c866e012))
* Allow Card UpdateBuilder methods that update user-related fields to use BravoUser objects or userId strings. ([7fff8a3](https://github.com/bscotch/favro-sdk/commit/7fff8a31a93128d1ac3f49181f812d6d52a4c25d))
* Change the UpdateBuilder to be explicitly used for updates instead of as a side effect. BREAKING ([91fb2a0](https://github.com/bscotch/favro-sdk/commit/91fb2a0747bc2ee4b73ee9f7ceddab2631fc926f))



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



