const mongodb = require("mongodb");

const Cursor = require("./cursor");
const Bulk = require("./bulk");

const oid = mongodb.ObjectId.createPk;

// TODO: Make this configurable by users
const writeOpts = { writeConcern: { w: 1 }, ordered: true };

module.exports = class Collection {
  constructor(db, name) {
    this.db = db;
    this.name = name;
  }

  connect() {
    return this.db
      .connect()
      .then((connection) => connection.collection(this.name));
  }

  find(query, projection, opts) {
    return this.connect().then((collection) => {
      if (this.db.features.useLegacyProjections) {
        return collection.find(query, projection, opts).toArray();
      }

      const options = Object.assign({ projection }, opts);
      return collection.find(query, options).toArray();
    });
  }

  findAsCursor(query, projection, opts) {
    return new Cursor(() =>
      this.connect().then((collection) => {
        if (this.db.features.useLegacyProjections) {
          return collection.find(query, projection, opts);
        }

        const options = Object.assign({ projection }, opts);
        return collection.find(query, options);
      })
    );
  }

  findOne(query, projection, opts) {
    return this.findAsCursor(query, projection, opts).next();
  }

  findAndModify(opts) {
    return this.runCommand("findAndModify", opts).then(
      (result) => result.value
    );
  }

  count(query, opts) {
    return this.connect().then((collection) => {
      return collection.countDocuments(query, opts);
    });
  }

  distinct(field, query) {
    return this.runCommand("distinct", { key: field, query: query }).then(
      (result) => result.values
    );
  }

  insert(docOrDocs, opts) {
    return Array.isArray(docOrDocs)
      ? this.insertMany(docOrDocs, opts)
      : this.insertOne(docOrDocs, opts);
  }

  insertOne(doc, opts) {
    if (!doc._id) doc._id = oid();

    return this.connect()
      .then((connection) =>
        connection.insertOne(doc, Object.assign({}, writeOpts, opts))
      )
      .then(() => doc);
  }

  insertMany(docs, opts) {
    for (let i = 0; i < docs.length; i++) {
      if (!docs[i]._id) docs[i]._id = oid();
    }

    return this.connect()
      .then((connection) =>
        connection.insertMany(docs, Object.assign({}, writeOpts, opts))
      )
      .then(() => docs);
  }

  update(query, update, opts) {
    opts = opts || {};
    const isMulti = opts.multi;

    return this.connect()
      .then((connection) => {
        const updateFn = isMulti
          ? connection.updateMany.bind(connection)
          : connection.updateOne.bind(connection);
        return updateFn(query, update, Object.assign({}, writeOpts, opts));
      })
      .then((result) => {
        // Parse the result to be compliant with the old standard:
        // https://github.com/mongodb/node-mongodb-native/blob/main/etc/notes/CHANGES_4.0.0.md#crud-results
        // Avoid using "ok" and "n".
        return Object.assign({}, result, {
          ok: result.acknowledged ? 1 : 0,
          n: result.modifiedCount || result.upsertedCount,
          nModified: result.modifiedCount,
          nUpserted: result.upsertedCount,
          upserted: result.upsertedCount ? [{ _id: result.upsertedId }] : null,
        });
      });
  }

  replaceOne(filter, replacement, opts) {
    opts = opts || {};

    return this.connect().then((connection) =>
      connection.replaceOne(
        filter,
        replacement,
        Object.assign({}, writeOpts, opts)
      )
    );
  }

  save(doc, opts) {
    opts = opts || {};

    if (doc._id) {
      return this.update(
        { _id: doc._id },
        { $set: doc },
        Object.assign({ upsert: true }, opts)
      ).then(() => doc);
    } else {
      return this.insert(doc, opts);
    }
  }

  remove(query, opts) {
    opts = opts || { justOne: false };

    if (typeof opts == "boolean") {
      opts = { justOne: opts };
    }

    const deleteOperation = opts.justOne ? "deleteOne" : "deleteMany";

    return this.connect()
      .then((connection) =>
        connection[deleteOperation](query, Object.assign({}, writeOpts, opts))
      )
      .then((commandResult) => {
        // Parse the result to be compliant with the old standard:
        // https://github.com/mongodb/node-mongodb-native/blob/main/etc/notes/CHANGES_4.0.0.md#crud-results
        return Object.assign({}, commandResult, {
          ok: commandResult.acknowledged ? 1 : 0,
          n: commandResult.deletedCount,
          nRemoved: commandResult.deletedCount,
        });
      });
  }

  deleteMany(query, opts) {
    return this.connect().then((connection) =>
      connection.deleteMany(query, Object.assign({}, writeOpts, opts))
    );
  }

  deleteOne(query, opts) {
    return this.connect().then((connection) =>
      connection.deleteOne(query, Object.assign({}, writeOpts, opts))
    );
  }

  rename(name, opts) {
    return this.connect().then((connection) => connection.rename(name, opts));
  }

  drop() {
    return this.runCommand("drop");
  }

  stats() {
    return this.runCommand("collStats");
  }

  runCommand(cmd, opts) {
    opts = opts || {};

    const cmdObject = Object.assign(
      {
        [cmd]: this.name,
      },
      opts
    );

    return this.db
      .connect()
      .then((connection) => connection.command(cmdObject));
  }

  toString() {
    return this.name;
  }

  dropIndexes() {
    return this.runCommand("dropIndexes", { index: "*" });
  }

  dropIndex(index) {
    return this.runCommand("dropIndexes", { index });
  }

  createIndex(index, opts) {
    opts = opts || {};

    return this.connect().then((connection) =>
      connection.createIndex(index, opts)
    );
  }

  ensureIndex(index, opts) {
    return this.createIndex(index, opts);
  }

  getIndexes() {
    return this.connect().then((connection) => connection.indexes());
  }

  reIndex() {
    return this.runCommand("reIndex");
  }

  isCapped() {
    return this.connect()
      .then((connection) => connection.isCapped())
      .then((isCapped) => !!isCapped);
  }

  aggregate(pipeline, opts) {
    return this.aggregateAsCursor(pipeline, opts).toArray();
  }

  aggregateAsCursor(pipeline, opts) {
    opts = opts || {};

    return new Cursor(() =>
      this.connect().then((collection) => collection.aggregate(pipeline, opts))
    );
  }

  initializeOrderedBulkOp(opts) {
    return new Bulk(this.name, true, () => this.db.connect(), opts);
  }

  initializeUnorderedBulkOp(opts) {
    return new Bulk(this.name, false, () => this.db.connect(), opts);
  }
};
