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
