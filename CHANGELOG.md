# [4.0.0](https://github.com/mongoist/mongoist/compare/v3.0.2...v4.0.0) (2025-03-28)


### Bug Fixes

* release pipeline ([9f25550](https://github.com/mongoist/mongoist/commit/9f25550d7f6995960d00c717b0142e697c6e29cf))


### Features

* **deps:** bump mongodb to support mongo v7.0 support ([#107](https://github.com/mongoist/mongoist/issues/107)) ([d36e9ea](https://github.com/mongoist/mongoist/commit/d36e9ea52de78e4e565edbff072f0679e27428e5))
* **deps:** bump mongodb to support mongo v7.0 support ([#107](https://github.com/mongoist/mongoist/issues/107)) ([32c126f](https://github.com/mongoist/mongoist/commit/32c126fde52751849c1b7e8acd58cb8cdc017ea6))


### BREAKING CHANGES

* **deps:** * chore: update node and mongodb versions in ci workflow

* chore: remove mongodb 3.6.2 from ci workflow

* chore: update node version to 16.20.1
* **deps:** * chore: update node and mongodb versions in ci workflow

* chore: remove mongodb 3.6.2 from ci workflow

* chore: update node version to 16.20.1

## [3.0.2](https://github.com/mongoist/mongoist/compare/v3.0.1...v3.0.2) (2024-10-01)


### Bug Fixes

* database connect race condition ([#106](https://github.com/mongoist/mongoist/issues/106)) ([197e590](https://github.com/mongoist/mongoist/commit/197e5903a59e03af0edc001982ec3daa2d2e10fb))

## [3.0.1](https://github.com/mongoist/mongoist/compare/v3.0.0...v3.0.1) (2024-08-23)


### Bug Fixes

* test for mongo 3.6.2 and 4.0 ([#104](https://github.com/mongoist/mongoist/issues/104)) ([851f22a](https://github.com/mongoist/mongoist/commit/851f22a678454fa174eda94f120c9274d01ce8aa))

# [3.0.0](https://github.com/mongoist/mongoist/compare/v2.7.0...v3.0.0) (2024-08-22)


* chore(deps)!: update mongodb to 4.8.0 (#101) ([e07e653](https://github.com/mongoist/mongoist/commit/e07e653d67adb787b11d441a971d26b949a6f8c3)), closes [#101](https://github.com/mongoist/mongoist/issues/101)


### BREAKING CHANGES

* updated mongodb to 4.8. deprecated functions like group

# [2.7.0](https://github.com/mongoist/mongoist/compare/v2.6.0...v2.7.0) (2023-07-07)


### Features

* **deps:** bump deps to force mongodb@3.7 with mongo 5.0 support ([#97](https://github.com/mongoist/mongoist/issues/97)) ([4b88d54](https://github.com/mongoist/mongoist/commit/4b88d5412e425ba2908cacd0123b3322a80ae7da))

# [2.6.0](https://github.com/mongoist/mongoist/compare/v2.5.6...v2.6.0) (2023-06-09)


### Features

* **collection:** add opts to count ([#96](https://github.com/mongoist/mongoist/issues/96)) ([c635b92](https://github.com/mongoist/mongoist/commit/c635b92bab6726d21e11a94c2c253a2755b69982))

## [2.5.6](https://github.com/mongoist/mongoist/compare/v2.5.5...v2.5.6) (2022-10-20)


### Bug Fixes

* **security:** update dependencies to remove security vulnerabilities  ([#86](https://github.com/mongoist/mongoist/issues/86)) ([7733149](https://github.com/mongoist/mongoist/commit/77331491f57176446ee3de492dcf63e285c545da)), closes [#85](https://github.com/mongoist/mongoist/issues/85)

## [2.5.6-alpha.1](https://github.com/mongoist/mongoist/compare/v2.5.5...v2.5.6-alpha.1) (2022-10-19)


### Bug Fixes

* **(security:** update dependencies to remove security vulnerabilities ([#85](https://github.com/mongoist/mongoist/issues/85)) ([207d831](https://github.com/mongoist/mongoist/commit/207d831e11206b116a68bbaa39cc8936e0973c20))

## [2.5.5](https://github.com/mongoist/mongoist/compare/v2.5.4...v2.5.5) (2020-08-16)

### Bug Fixes

- fix Flow types [PR](https://github.com/mongoist/mongoist/pull/80).

### [2.5.4](https://github.com/mongoist/mongoist/compare/v2.5.3...v2.5.4) (2020-08-04)

### Bug Fixes

- fixes bug where connection options weren't passed to the Mongo driver [PR](https://github.com/mongoist/mongoist/pull/72).

### [2.5.3](https://github.com/mongoist/mongoist/compare/v2.5.2...v2.5.3) (2020-08-04)

### Bug Fixes

- fixes the type definition for `Cursor.count()` so it reflects the implementation.

### [2.5.2](https://github.com/mongoist/mongoist/compare/v2.5.1...v2.5.2) (2020-04-16)


### Bug Fixes

* report `writeErrors` for bulk ops ([0079896](https://github.com/mongoist/mongoist/commit/00798961b3686ca3fb19c2e467dae87c541b02e9))

### [2.5.1](https://github.com/mongoist/mongoist/compare/v2.5.0...v2.5.1) (2020-03-06)


### Bug Fixes

* correct signature on Database#close ([88b0988](https://github.com/mongoist/mongoist/commit/88b09881e8b81307b1221f87619ebef4c0158f10))

## [2.5.0](https://github.com/mongoist/mongoist/compare/v2.4.0...v2.5.0) (2020-03-03)


### Features

* add flow types ([#43](https://github.com/mongoist/mongoist/issues/43)) ([37a3c4c](https://github.com/mongoist/mongoist/commit/37a3c4ceb856a02a3689d30405109820a50229b9))

## [2.4.0](https://github.com/mongoist/mongoist/compare/v2.3.0...v2.4.0) (2019-12-16)


### Features

* **connect:** support promises for `connectionString` ([#39](https://github.com/mongoist/mongoist/issues/41)) ([71b1e61](https://github.com/mongoist/mongoist/commit/71b1e61c0abe51db03457520f7cd7af13176a45c))

## [2.3.0](https://github.com/mongoist/mongoist/compare/v2.2.0...v2.3.0) (2019-12-13)


### Features

* **cursor:** support collations ([#39](https://github.com/mongoist/mongoist/issues/39)) ([1f376ed](https://github.com/mongoist/mongoist/commit/1f376ed20d48e21b22701ef226b89c71af7ea471))

## [2.2.0](https://github.com/mongoist/mongoist/compare/v2.1.0...v2.2.0) (2019-11-23)


### Features

* **cursor:** support async iteration ([#36](https://github.com/mongoist/mongoist/issues/36)) ([9a826ad](https://github.com/mongoist/mongoist/commit/9a826ad311af52878b009ba896225d8ac1171f26)), closes [#35](https://github.com/mongoist/mongoist/issues/35)

## [2.1.0](https://github.com/mongoist/mongoist/compare/v2.0.0...v2.1.0) (2019-11-09)


### Features

* add addCursorFlag method ([#26](https://github.com/mongoist/mongoist/issues/26)) ([318c975](https://github.com/mongoist/mongoist/commit/318c975a78b8271a341d4a5a93c48316b9e45bf7))
* Add adminCommand database method ([#30](https://github.com/mongoist/mongoist/issues/30)) ([07705c5](https://github.com/mongoist/mongoist/commit/07705c555383d6c1c11c3904e85f0356f72db00b))


### Bug Fixes

* remove cross-env to not break builds in node 6 and 7 ([e677ec7](https://github.com/mongoist/mongoist/commit/e677ec7a27da6b30675ee6838622076a09726b23))

<a name="2.0.0"></a>
# [2.0.0](https://github.com/saintedlama/mongoist/compare/v1.7.4...v2.0.0) (2018-12-06)


### Bug Fixes

* handling of mongodb+srv protocol ([e267db5](https://github.com/saintedlama/mongoist/commit/e267db5))
* resolve deprecation warnings ([#21](https://github.com/saintedlama/mongoist/issues/21)) ([ca4f5d5](https://github.com/saintedlama/mongoist/commit/ca4f5d5))


### Features

* use mongodb 3.1 driver, fix +srv handling ([f159a38](https://github.com/saintedlama/mongoist/commit/f159a38))


### BREAKING CHANGES

* by using mongodb 3.1 driver specifying a port in the connection string is required



<a name="1.7.4"></a>
## [1.7.4](https://github.com/saintedlama/mongoist/compare/v1.7.3...v1.7.4) (2018-06-04)



<a name="1.7.3"></a>
## [1.7.3](https://github.com/saintedlama/mongoist/compare/v1.7.2...v1.7.3) (2018-05-27)


### Bug Fixes

* update vulnerable dependencies ([cd473a2](https://github.com/saintedlama/mongoist/commit/cd473a2))



<a name="1.7.2"></a>
## [1.7.2](https://github.com/saintedlama/mongoist/compare/v1.7.1...v1.7.2) (2018-03-14)


### Bug Fixes

* implement feature detection to prevent mongojs connections to break projection logic in mongoist ([ee5c9e1](https://github.com/saintedlama/mongoist/commit/ee5c9e1))



<a name="1.7.1"></a>
## [1.7.1](https://github.com/saintedlama/mongoist/compare/v1.7.0...v1.7.1) (2018-03-05)


### Bug Fixes

* support projection in findAsCursor ([1ef60c8](https://github.com/saintedlama/mongoist/commit/1ef60c8))



<a name="1.7.0"></a>
# [1.7.0](https://github.com/saintedlama/mongoist/compare/v1.6.0...v1.7.0) (2018-03-01)


### Bug Fixes

* apply minor updates ([8f1efcc](https://github.com/saintedlama/mongoist/commit/8f1efcc))
* catch promise rejections in close and emit error output using debug ([b79ffe8](https://github.com/saintedlama/mongoist/commit/b79ffe8))
* close all database connections in tests ([89bc655](https://github.com/saintedlama/mongoist/commit/89bc655))
* pass force parameter to client close ([1153fe9](https://github.com/saintedlama/mongoist/commit/1153fe9))


### Features

* update mongodb driver to version 3 ([f154952](https://github.com/saintedlama/mongoist/commit/f154952))



<a name="1.6.0"></a>
# [1.6.0](https://github.com/saintedlama/mongoist/compare/v1.5.1...v1.6.0) (2018-02-20)


### Features

* expose protoypes of mongoist ([794bbe7](https://github.com/saintedlama/mongoist/commit/794bbe7))



1.5.0 / 2017-10-28
==================

  * 1.5.0
  * test: add test for toString method of collection
  * test: test symbol handling
  * :bug: Allow construction with a mongist connection
    Currently, when calling `mongoist()` with an existing mongoist
    connection, the database fails to initialize properly resulting in
    undefined errors when calling database or collection methods.
    I added an affordance for checking if the `connectionString` is an
    instance of `Database` which means we can call the connect function
    on that database to initialize this mongoist instance.

1.4.3 / 2017-10-14
==================

  * chore: update changelog
  * 1.4.3
  * fix: emit error when underlying cursor throws an error

1.4.2 / 2017-10-11
==================

  * 1.4.2
  * fix: always create a non undefined options field
  * docs: remove callback argument and duplicate api methods
  * chore: update changelog

1.4.1 / 2017-10-11
==================

  * 1.4.1
  * fix: proxy should not use symbols as collection name and should check db properties for strict null
  * docs: reference foo pony async/await tutorial
  * chore: add editorconfig
  * Fixed SyntaxError and minor grammatical changes.
    Added an italic line at the beginning of the examples to let users know to call await lines in async functions. Also fixed some minor grammatical errors and added the mongodb links for the bulk section.
  * chore: update changelog

1.4.0 / 2017-09-22
==================

  * 1.4.0
  * feat: Implement missing cursor methods including readable stream interface
  * chore: improve test coverage for database
  * chore: ignore non test files from babel
  * chore: install babel-polyfill and babel-preset-env
  * fix: add .babelrc and babel-preset-env
  * chore: use babel-register to transpile tests for node version 6 and 7
  * Update changelog

1.3.0 / 2017-09-20
==================

  * 1.3.0
  * Merge branch 'master' of github.com:saintedlama/mongoist
  * fix: relaxe engine requirement [#3](https://github.com/saintedlama/mongoist/issues/3)
  * feat: remove async/await from non test files
  * doc: bulk updates are implemented
  * Increase timeout
  * chore: add changelog

1.2.1 / 2017-09-19
==================

  * 1.2.1
  * fix: require 'bulk' not 'Bulk'

1.2.0 / 2017-09-19
==================

  * 1.2.0
  * feat: implement bulk operations
  * chore: add prefer-const and no-var eslint rules
  * doc: reference mongoist

1.1.0 / 2017-09-18
==================

  * 1.1.0
  * feat: support passing a mongojs connection to mongoist
  * Fix [#1](https://github.com/saintedlama/mongoist/issues/1) documentation error

1.0.1 / 2017-09-15
==================

  * 1.0.1
  * Correct behavior of findAndModify to return the doc not the result

1.0.0 / 2017-09-15
==================

  * Merge branch 'fix-old-mongodb-versions'
  * Ignore coverage when running eslint
  * Remove console.log from database tests
  * Add engines filed to restrict node versions to async/await support
  * Filter system collections from result since older mongodb versions include system collections
  * Add back old mongodb versions to build matrix and log collections and collection names on travis
  * Correct package description
  * Remove old mongodb version from build matrix
  * Add README.md
  * Initial commit
