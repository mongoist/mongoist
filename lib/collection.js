const mongodb = require('mongodb');

const Cursor = require('./cursor');
const Bulk = require('./bulk');

const oid = mongodb.ObjectID.createPk;

// TODO: Make this configurable by users
const writeOpts = { writeConcern: { w: 1 }, ordered: true }

module.exports = class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  connect() {
    return this.db.connect().then(connection => connection.collection(this.name));
  }

  find(query, projection, opts) {
    return this
      .connect()
      .then(collection => {
        if (this.db.features.useLegacyProjections) {
          return collection.find(query, projection, opts).toArray();
        }

        const options = Object.assign({ projection }, opts);
        return collection.find(query, options).toArray();
      });
  }

  findAsCursor(query, projection, opts) {
    return new Cursor(() => this
      .connect()
      .then(collection => {
        if (this.db.features.useLegacyProjections) {
          return collection.find(query, projection, opts);
        }

        const options = Object.assign({ projection }, opts);
        return collection.find(query, options);
      }));
  }

  findOne(query, projection, opts) {
    return this
      .findAsCursor(query, projection, opts)
      .next();
  }

  findAndModify(opts) {
    return this.runCommand('findAndModify', opts)
      .then(result => result.value);
  }

  count(query) {
    return this
      .connect()
      .then(collection => collection.countDocuments(query));
  }

  distinct(field, query) {
    return this
      .runCommand('distinct', { key: field, query: query })
      .then(result => result.values);
  }

  insert(docOrDocs, opts) {
    return Array.isArray(docOrDocs)
      ? this.insertMany(docOrDocs, opts)
      : this.insertOne(docOrDocs, opts);
  }

  insertOne(doc, opts) {
    if (!doc._id) doc._id = oid();

    return this
      .connect()
      .then(collection => collection.insertOne(doc, Object.assign({}, writeOpts, opts)))
      .then(() => doc);
  }

  insertMany(docs, opts) {
    for (let i = 0; i < docs.length; i++) {
      if (!docs[i]._id) docs[i]._id = oid();
    }

    return this
      .connect()
      .then(collection => collection.insertMany(docs, Object.assign({}, writeOpts, opts)))
      .then(() => docs);
  }

  update(query, update, opts) {
    opts = opts || {};
    const isMulti = opts.multi

    return this
      .connect()
      .then(collection => {
        const updateFn = isMulti
          ? collection.updateMany.bind(collection)
          : collection.updateOne.bind(collection)
        return updateFn(query, update, Object.assign({}, writeOpts, opts))
      })
      .then((result) => {
        // Parse the result to be compliant with the old standard:
        // https://github.com/mongodb/specifications/blob/master/source/crud/crud.rst#write-results
        // Avoid using "ok" and "n".
        return Object.assign({}, result, {
          ok: result.acknowledged,
          n: result.modifiedCount || result.upsertedCount,
        })
      });
  }

  replaceOne(filter, replacement, opts) {
    opts = opts || {};

    return this
      .connect()
      .then(collection => collection.replaceOne(filter, replacement, Object.assign({}, writeOpts, opts)));
  }

  save(doc, opts) {
    opts = opts || {};

    if (doc._id) {
      return this
        .update({ _id: doc._id }, { $set: doc }, Object.assign({ upsert: true }, opts))
        .then(() => doc);
    } else {
      return this.insert(doc, opts);
    }
  }

  remove(query, opts) {
    opts = opts || { justOne: false };

    if (typeof opts == 'boolean') {
      opts = { justOne: opts };
    }

    const deleteOperation = opts.justOne ? 'deleteOne' : 'deleteMany';

    return this.connect()
      .then(collection => collection[deleteOperation](query, Object.assign({}, writeOpts, opts)))
      .then(result => {
        // Parse the result to be compliant with the old standard:
        // https://github.com/mongodb/specifications/blob/master/source/crud/crud.rst#write-results
        // Avoid using "ok" and "n".
        return Object.assign({}, result, {
          ok: result.acknowledged,
          n: result.deletedCount
        })
      });
  }

  rename(name, opts) {
    return this
      .connect()
      .then(collection => collection.rename(name, opts));
  }

  drop() {
    return this.runCommand('drop');
  }

  stats() {
    return this.runCommand('collStats');
  }

  /** @deprecated Please use the aggregation pipeline instead */
  mapReduce(map, reduce, opts) {
    opts = opts || {};

    return this
      .connect()
      .then(collection => collection.mapReduce(map, reduce, opts));
  }

  runCommand(cmd, opts) {
    opts = opts || {}

    const cmdObject = Object.assign({
      [cmd]: this.name,
    }, opts);

    return this.db
      .connect()
      .then(collection => collection.command(cmdObject));
  }

  toString() {
    return this.name;
  }

  dropIndexes() {
    return this.runCommand('dropIndexes', { index: '*' });
  }

  dropIndex(index) {
    return this.runCommand('dropIndexes', { index });
  }

  createIndex(index, opts) {
    opts = opts || {};

    return this.connect()
      .then(collection => collection.createIndex(index, opts));
  }

  ensureIndex(index, opts) {
    return this.createIndex(index, opts)
  }

  getIndexes() {
    return this.connect()
      .then(collection => collection.indexes());
  }

  reIndex() {
    return this.runCommand('reIndex');
  }

  isCapped() {
    return this.connect()
      .then(collection => collection.isCapped())
      .then(isCapped => !!isCapped);
  }

  aggregate(pipeline, opts) {
    return this.aggregateAsCursor(pipeline, opts).toArray();
  }

  aggregateAsCursor(pipeline, opts) {
    opts = opts || {};

    return new Cursor(() => this
      .connect()
      .then(collection => collection.aggregate(pipeline, opts))
    );
  }

  initializeOrderedBulkOp(opts) {
    return new Bulk(this.name, true, () => this.db.connect(), opts);
  }

  initializeUnorderedBulkOp(opts) {
    return new Bulk(this.name, false, () => this.db.connect(), opts);
  }
}
