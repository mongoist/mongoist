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
      .then(collection => collection.find(query, projection, opts).toArray());
  }

  findAsCursor(query, projection, opts) {
    return new Cursor(() => this
      .connect()
      .then(collection => collection.find(query, projection, opts))
    );
  }

  findOne(query, projection) {
    return this
      .findAsCursor(query, projection)
      .next();
  }

  findAndModify(opts) {
    return this.runCommand('findAndModify', opts)
      .then(result => result.value);
  }

  count(query) {
    return this
      .findAsCursor(query)
      .count();
  }

  distinct(field, query) {
    return this
      .runCommand('distinct', { key: field, query: query })
      .then(result => result.values);
  }

  insert(docOrDocs, opts) {
    const docs = Array.isArray(docOrDocs) ? docOrDocs : [docOrDocs];

    for (let i = 0; i < docs.length; i++) {
      if (!docs[i]._id) docs[i]._id = oid();
    }

    return this
      .connect()
      .then(connection => connection.insert(docs, Object.assign({}, writeOpts, opts)))
      .then(() => docOrDocs);
  }

  update(query, update, opts) {
    opts = opts || {};

    return this
      .connect()
      .then(connection => connection.update(query, update, Object.assign({}, writeOpts, opts)))
      .then((result) => result.result);
  }

  save(doc, opts) {
    opts = opts || {};

    if (doc._id) {
      return this
        .update({ _id: doc._id }, doc, Object.assign({ upsert: true }, opts))
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
      .then(connection => connection[deleteOperation](query, Object.assign({}, writeOpts, opts)))
      .then(commandResult => {
        commandResult.result.deletedCount = commandResult.deletedCount;

        return commandResult.result;
      });
  }

  rename(name, opts) {
    return this
      .connect()
      .then(connection => connection.rename(name, opts));
  }

  drop() {
    return this.runCommand('drop');
  }

  stats() {
    return this.runCommand('collStats');
  }

  mapReduce(map, reduce, opts) {
    opts = opts || {};

    return this
      .connect()
      .then(connection => connection.mapReduce(map, reduce, opts));
  }

  runCommand(cmd, opts) {
    opts = opts || {}

    const cmdObject = Object.assign({
      [cmd]: this.name,
    }, opts);

    return this.db
      .connect()
      .then(connection => connection.command(cmdObject));
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

    return this.connect().then(connection => connection.createIndex(index, opts));
  }

  ensureIndex(index, opts) {
    opts = opts || {};

    return this.connect().then(connection => connection.ensureIndex(index, opts));
  }

  getIndexes() {
    return this.connect().then(connection => connection.indexes());
  }

  reIndex() {
    return this.runCommand('reIndex');
  }

  isCapped() {
    return this.connect()
      .then(connection => connection.isCapped())
      .then(isCapped => !!isCapped);
  }

  group(doc) {
    return this
      .connect()
      .then(connection => connection.group(doc.key, doc.cond, doc.initial, doc.reduce, doc.finalize, false));
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