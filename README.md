# mongoist

A [node.js](http://nodejs.org) module for mongodb built with async/await in mind, that emulates [the official mongodb API](http://www.mongodb.org/display/DOCS/Home) as much as possible.

Mongoist driver is heavily inspired by mongojs.

[![Build Status](https://travis-ci.org/saintedlama/mongoist.svg?branch=master)](https://travis-ci.org/saintedlama/mongoist)
[![Coverage Status](https://coveralls.io/repos/github/saintedlama/mongoist/badge.svg?branch=master)](https://coveralls.io/github/saintedlama/mongoist?branch=master)
[![mongoist analyzed by Codellama.io](https://app.codellama.io/api/badges/5a0439591b4c363a0f9427e6/31ad4e758e5c06b9e1d9d7e0d74cb475)](https://app.codellama.io/repositories/5a0439591b4c363a0f9427e6)

## Motivation

The official MongoDB driver for Node.js (https://github.com/mongodb/node-mongodb-native) leaves connection management to the user - this means to connect
to a mongodb database this boilerplate code is needed

```javascript
const { MongoClient } = require('mongodb');

MongoClient
  .connect('mongodb://localhost:27017/myproject')
  .then(connection => {

    connection.close();
  });
```

Due to the asynchronous nature of `connect`, a connection that is used everywhere in an application is not that easy to export from a module.

```javascript
const { MongoClient } = require('mongodb');

MongoClient
  .connect('mongodb://localhost:27017/myproject')
  .then(connection => {

    // THIS WILL NOT WORK AS EXPECTED!!!
    module.exports = connection;
  });
```

Mongoist solves this problem by managing the connection internally in a lazy fashion. With mongoist you can create a `db.js` module exporting a
not yet opened database connection:

```javascript
module.exports = mongoist(connectionString);
```

## Usage

_Please note: Any line in the examples that uses the await keyword should be called inside an async function. If you haven't used async/await yet, you'll want to do some research to help you understand how it works. Or take a look at https://ponyfoo.com/articles/understanding-javascript-async-await for a great read about async/await_

### Connecting

```javascript
const mongoist = require('mongoist');
const db = mongoist(connectionString, connectionOptions)
```

The `connectionString` and `connectionOptions` are passed to the underlying official mongodb driver.
[Find out more about connection strings and options](http://mongodb.github.io/node-mongodb-native/2.2/reference/connecting/).

#### Migrating from mongojs

While mongojs uses callbacks only, mongoist uses promises only. To allow migrating to mongoist without migrating the whole application,
mongoist supports wrapping the mongojs driver.

```javascript
const mongojsDb = mongojs(connectionString);
const db = mongoist(mongojsDb);

async function findDocuments() {
  const docs = await db.a.find({});
  // ...
}

// We need to call the async function this way since top level await keyword is not allowed in JavaScript
findDocuments().then(() => console.log('Done querying mongodb'));

```

#### Connection Management

Mongoist uses the connection pool provided by the official mongodb driver, so there is no need to manage connections on your own.
For most use cases it's best to create a `db.js` node module that exports a mongoist database connection.

```javascript
module.exports = mongoist(connectionString);
```

### Accessing Collections

Mongoist uses a proxy implementation under the hood to allow accessing a collection named `foo` as

```javascript
db.foo.find(...);
```

instead of

```javascript
db.collection('foo').find(...);
```

### Examples

```javascript
// find everything in mycollection returned as array
const documents = await db.mycollection.find();

// find everything in mycollection, but sort by name
const sortedDocuments = await db.mycollection.findAsCursor().sort({name: 1}).toArray();

// find a document using a native ObjectId
const documentById = await db.mycollection.findOne({ _id: mongoist.ObjectId('523209c4561c640000000001') });

// Update all documents named 'mathias' and increment their level
const resultUpdate = await db.mycollection.update({name: 'mathias'}, {$inc: {level: 1}}, {multi: true});

// find one named 'mathias', tag him as a contributor and return the modified doc
const resultFindAndModify = await db.mycollection.findAndModify({
  query: { name: 'mathias' },
  update: { $set: { tag: 'maintainer' } },
  new: true
});

// use the save function to just save a document
const doc = await db.mycollection.save({created: 'just now'});
```

### Cursor Operations

The mongodb operations `find` and `aggregate` return a cursor, that is resolved in the mongodb shell to an array. Mongoist
provides the operations `findAsCursor` and `aggregateAsCursor` to return a cursor, and shorthand functions `find` and
`aggregate` to return an array.

## Bulk updates

```javascript
var bulk = db.a.initializeOrderedBulkOp()
bulk.find({type: 'water'}).update({$set: {level: 1}})
bulk.find({type: 'water'}).update({$inc: {level: 2}})
bulk.insert({name: 'Spearow', type: 'flying'})
bulk.insert({name: 'Pidgeotto', type: 'flying'})
bulk.insert({name: 'Charmeleon', type: 'fire'})
bulk.find({type: 'flying'}).removeOne()
bulk.find({type: 'fire'}).remove()
bulk.find({type: 'water'}).updateOne({$set: {hp: 100}})

await bulk.execute();
// done...
```

### Events

```js
const db = mongoist('mongodb://localhost/mydb')

// Emitted if no db connection could be established
db.on('error', function (err) {
  console.log('database error', err)
});

// Emitted if a db connection was established
db.on('connect', function () {
  console.log('database connected')
})
```

### Database commands

With mongoist you can run database commands just like with the mongo shell using `db.runCommand()`

```js
const result = await db.runCommand({ping: 1});
console.log('we\'re up');
```

or `db.collection.runCommand()`

```js
const result = await db.things.runCommand('count');
console.log(result);
```

### Replication Sets

Mongoist can connect to a mongo replication set by providing a connection string with multiple hosts

```js
const db = mongoist('rs-1.com,rs-2.com,rs-3.com/mydb?slaveOk=true');
```

For more detailed information about replica sets see [the mongo replication docs](http://www.mongodb.org/display/DOCS/Replica+Sets)

## API

This API documentation is a work in progress.

### Exposed Prototypes

Mongoist exposes the prototypes of `Database`, `Collection`, `Cursor` and `Bulk`
to provide basic support for mocking, stubbing data access in tests.

```js
const mongoist = require('mongoist');

// Override collection find behavior to always return { foo: 'bar' }
mongoist.Collection.find = function() {
  return [
    { foo: 'bar' }
  ]
}
```

### Collection

All operations return promises. If a return type is given, this is the type of the resolved promise.

#### `db.collection.aggregate(pipelineArray, [options])`

See https://docs.mongodb.org/manual/reference/method/db.collection.aggregate/

#### `db.collection.aggregateAsCursor(pipelineArray, [options])`

Returns a cursor instead of an array as `db.collection.aggregate` does.

See https://docs.mongodb.org/manual/reference/method/db.collection.aggregate/

#### `db.collection.count([query])`

See https://docs.mongodb.org/manual/reference/method/db.collection.count/

#### `db.collection.createIndex(keys, options)`

See https://docs.mongodb.org/manual/reference/method/db.collection.createIndex/

#### `db.collection.distinct(field, query)`

See https://docs.mongodb.org/manual/reference/method/db.collection.distinct/

#### `db.collection.drop()`

See https://docs.mongodb.org/manual/reference/method/db.collection.drop/

#### `db.collection.dropIndex(index)`

See https://docs.mongodb.org/manual/reference/method/db.collection.dropIndex/

#### `db.collection.dropIndexes()`

See https://docs.mongodb.org/manual/reference/method/db.collection.dropIndexes/

#### `db.collection.ensureIndex(keys, options)`

See https://docs.mongodb.org/manual/reference/method/db.collection.ensureIndex/

**Deprecation Notice**: Deprecated since version 3.0.0: db.collection.ensureIndex() is now an alias for db.collection.createIndex().

#### `db.collection.find([query], [projection])`

Returns an array of documents.

See https://docs.mongodb.org/manual/reference/method/db.collection.find/

#### `db.collection.findAsCursor([query], [projection])`

Returns a cursor instead of an array as `db.collection.find` does.

See https://docs.mongodb.org/manual/reference/method/db.collection.find/

#### `db.collection.findOne([query], [projection])`

Apply a query and returns one single document.

See https://docs.mongodb.org/manual/reference/method/db.collection.findOne/

#### `db.collection.findAndModify(document)`

See https://docs.mongodb.org/manual/reference/method/db.collection.findAndModify/

#### `db.collection.getIndexes()`

See https://docs.mongodb.org/manual/reference/method/db.collection.getIndexes/

#### `db.collection.group(document)`

See https://docs.mongodb.org/manual/reference/method/db.collection.group/

**Deprecation Notice**: Deprecated since version 3.4: Mongodb 3.4 deprecates the db.collection.group() method. Use db.collection.aggregate() with the $group stage or db.collection.mapReduce() instead.

#### `db.collection.insert(docOrDocs, options)`

See https://docs.mongodb.com/manual/reference/method/db.collection.insert/

#### `db.collection.isCapped()`

See https://docs.mongodb.com/manual/reference/method/db.collection.isCapped/

#### `db.collection.mapReduce(map, reduce, options)`

See https://docs.mongodb.com/manual/reference/method/db.collection.mapReduce/

#### `db.collection.reIndex()`

See https://docs.mongodb.com/manual/reference/method/db.collection.reIndex/

#### `db.collection.remove(query, [justOne])`

Equivalent to `db.collection.remove(query, { justOne: true/false })`

See https://docs.mongodb.com/manual/reference/method/db.collection.remove/

#### `db.collection.remove(query, [options])`

See https://docs.mongodb.com/manual/reference/method/db.collection.remove/

#### `db.collection.runCommand(command)`

See https://docs.mongodb.com/manual/reference/method/db.collection.runCommand/

#### `db.collection.save(doc, [options])`

See https://docs.mongodb.com/manual/reference/method/db.collection.save/

#### `db.collection.stats()`

See https://docs.mongodb.com/manual/reference/method/db.collection.stats/

#### `db.collection.update(query, update, [options])`

See https://docs.mongodb.com/manual/reference/method/db.collection.update/

#### `db.collection.initializeOrderedBulkOp([options])`

Creates a new ordered bulk. This operation is sync so no `await` is needed. See the **Bulk** section for more details.

#### `db.collection.initializeUnorderedBulkOp([options])`

Creates a new unordered bulk. This operation is sync so no `await` is needed. See the **Bulk** section for more details.

#### `db.collection.toString()`

Get the name of the collection.

### Cursor

Cursor implements a readable stream. For example, you can pipe a cursor to a writeable stream.

```javascript
db.someCollection.findAsCursor()
  .pipe(writeableStream)
  .on('finish', () => {
    console.log('all documents piped to writeableStream');
  });
```

#### `cursor.batchSize(size)`

See https://docs.mongodb.com/manual/reference/method/cursor.batchSize/

#### `cursor.count()`

See https://docs.mongodb.com/manual/reference/method/cursor.count/

#### `cursor.explain()`

See https://docs.mongodb.com/manual/reference/method/cursor.explain/

#### `cursor.limit(n)`

See https://docs.mongodb.com/manual/reference/method/cursor.limit/

#### `cursor.next()`

See https://docs.mongodb.com/manual/reference/method/cursor.next/

#### `cursor.hasNext()`

See https://docs.mongodb.com/manual/reference/method/cursor.hasNext/

#### `cursor.forEach(fn)`

See https://docs.mongodb.com/manual/reference/method/cursor.foreach/

#### `cursor.map(fn)`

See https://docs.mongodb.com/manual/reference/method/cursor.map/

#### `cursor.rewind()`

Rewinds a cursor.

#### `cursor.skip(n)`

See https://docs.mongodb.com/manual/reference/method/cursor.skip/

#### `cursor.sort(sortOptions)`

See https://docs.mongodb.com/manual/reference/method/cursor.sort/

#### `cursor.toArray()`

See https://docs.mongodb.com/manual/reference/method/cursor.toArray/

#### `cursor.close()` (alias `cursor.destroy()`)

https://docs.mongodb.com/manual/reference/method/cursor.close/

### Database

#### `db.createUser(document)`

See https://docs.mongodb.com/manual/reference/method/db.createUser/

#### `db.dropUser(username)`

See https://docs.mongodb.com/manual/reference/method/db.dropUser/

#### `db.dropAllUsers()`

See https://docs.mongodb.com/manual/reference/method/db.dropAllUsers/

#### `db.createCollection(name, options)`

See https://docs.mongodb.com/manual/reference/method/db.createCollection/

#### `db.getCollectionNames()`

See https://docs.mongodb.com/manual/reference/method/db.getCollectionNames/

#### `db.getCollectionInfos()` (alias `db.listCollections()`)

See https://docs.mongodb.com/manual/reference/method/db.getCollectionInfos/

#### `db.getLastError()`

See https://docs.mongodb.com/manual/reference/method/db.getLastError/

#### `db.getLastErrorObj()`

See https://docs.mongodb.com/manual/reference/method/db.getLastErrorObj/

#### `db.runCommand(command)`

See https://docs.mongodb.com/manual/reference/method/db.runCommand/

#### `db.stats()`

See https://docs.mongodb.com/manual/reference/method/db.stats/

#### `db.close()`

See https://docs.mongodb.com/manual/reference/method/db.close/

#### `db.dropDatabase()`

See https://docs.mongodb.com/manual/reference/method/db.dropDatabase/

### Bulk

#### `bulk.execute()`

Executes a bulk.

See https://docs.mongodb.com/manual/reference/method/Bulk.execute/

#### `bulk.find(query)`

See https://docs.mongodb.com/manual/reference/method/Bulk.find/

#### `bulk.find.remove()`

See https://docs.mongodb.com/manual/reference/method/Bulk.find.remove/

#### `bulk.find.removeOne()`

See https://docs.mongodb.com/manual/reference/method/Bulk.find.removeOne/

#### `bulk.find.replaceOne(document)`

See https://docs.mongodb.com/manual/reference/method/Bulk.find.replaceOne/

#### `bulk.find.update(updaterParam)`

See https://docs.mongodb.com/manual/reference/method/Bulk.find.update/

#### `bulk.find.updateOne(updaterParam)`

See https://docs.mongodb.com/manual/reference/method/Bulk.find.updateOne/

#### `bulk.find.upsert(upsertParam)`

See https://docs.mongodb.com/manual/reference/method/Bulk.find.upsert/

#### `bulk.insert(document)`

See https://docs.mongodb.com/manual/reference/method/Bulk.insert/

#### `bulk.toString()`

See https://docs.mongodb.com/manual/reference/method/Bulk.toString/

#### `bulk.tojson()`

See https://docs.mongodb.com/manual/reference/method/Bulk.tojson/
