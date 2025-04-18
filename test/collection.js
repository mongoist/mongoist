const { expect } = require("chai");
const dropMongoDbCollections = require("drop-mongodb-collections");
const mongoist = require("../");

const connectionString = "mongodb://localhost:27017/test";

describe("collection", function () {
  this.timeout(10000);

  let db;

  beforeEach(dropMongoDbCollections(connectionString));
  beforeEach(async () => {
    db = mongoist(connectionString);

    await db.a.insert([
      {
        name: "Squirtle",
        type: "water",
        level: 10,
      },
      {
        name: "Starmie",
        type: "water",
        level: 8,
      },
      {
        name: "Charmander",
        type: "fire",
        level: 8,
      },
      {
        name: "Lapras",
        type: "water",
        level: 12,
      },
    ]);
  });

  afterEach(() => db.close());

  it("should insert a single document", async () => {
    const doc = await db.b.insert({ foo: "bar" });

    expect(doc.foo).to.equal("bar");
    expect(doc._id).to.exist;
  });

  it("should insert document arrays", async () => {
    const docs = await db.b.insert([{ foo: "bar" }, { foo: "bar" }]);

    expect(docs).to.have.length(2);

    expect(docs[0].foo).to.equal("bar");
    expect(docs[1].foo).to.equal("bar");
  });

  it("should insert document with options", async () => {
    const docs = await db.b.insert([{ foo: "bar" }, { foo: "bar" }], {
      ordered: true,
    });

    expect(docs).to.have.length(2);

    expect(docs[0].foo).to.equal("bar");
    expect(docs[1].foo).to.equal("bar");
  });

  it("should find documents", async () => {
    const docs = await db.a.find({});

    expect(docs).to.have.length(4);

    expect(docs[0].name).to.equal("Squirtle");
    expect(docs[0].type).to.equal("water");

    expect(docs[1].name).to.equal("Starmie");
    expect(docs[1].type).to.equal("water");

    expect(docs[2].name).to.equal("Charmander");
    expect(docs[2].type).to.equal("fire");

    expect(docs[3].name).to.equal("Lapras");
    expect(docs[3].type).to.equal("water");
  });

  it("should find documents with a projection", async () => {
    const docs = await db.a.find({}, { name: 1 });

    expect(docs).to.have.length(4);
    expect(docs[0].name).to.equal("Squirtle");
    expect(docs[0].type).to.not.exist;
  });

  it("should find using an awaitable cursor", async () => {
    const docs = await db.a
      .findAsCursor({})
      .sort({ name: 1 })
      .limit(1)
      .toArray();

    expect(docs).to.have.length(1);
    expect(docs[0].name).to.equal("Charmander");
    expect(docs[0].type).to.equal("fire");
  });

  it("should find one document", async () => {
    const squirtle = await db.a.findOne({ name: "Squirtle" });

    expect(squirtle.name).to.equal("Squirtle");
    expect(squirtle.type).to.equal("water");
  });

  it("should find one document with projection", async () => {
    const squirtle = await db.a.findOne({ name: "Squirtle" }, { type: 1 });

    expect(squirtle.name).to.not.exist;
    expect(squirtle.type).to.equal("water");
    expect(squirtle._id).to.exist;
  });

  it("should findAndModify a document and return the new document", async () => {
    const result = await db.a.findAndModify({
      query: { name: "Squirtle" },
      new: true,
      update: { $set: { name: "Squirtle Brawl" } },
    });

    expect(result.name).to.equal("Squirtle Brawl");
  });

  it("should findAndModify a document and return old value", async () => {
    const result = await db.a.findAndModify({
      query: { name: "Squirtle" },
      update: { $set: { name: "Squirtle Brawl" } },
    });

    expect(result.name).to.equal("Squirtle");
  });

  it("should count queried documents", async () => {
    const count = await db.a.count({ type: "water" });

    expect(count).to.equal(3);
  });

  it("should count using options", async () => {
    const count = await db.a.count({ type: "water" }, { limit: 1 });

    expect(count).to.equal(1);
  });

  it("should query distinct documents", async () => {
    const docs = await db.a.distinct("name", { type: "water" });

    expect(docs.length).to.equal(3);
    expect(docs.sort()).to.deep.equal(["Lapras", "Squirtle", "Starmie"]);
  });

  it("should update a document", async () => {
    const lastErrorObject = await db.a.update(
      { type: "water" },
      { $set: { type: "aqua" } }
    );
    expect(lastErrorObject.n).to.equal(1);

    const updatedDocsCount = await db.a.count({ type: "aqua" });
    expect(updatedDocsCount).equal(1);

    const idleDocsCount = await db.a.count({ type: "water" });
    expect(idleDocsCount).equal(2);
  });

  it("should update multiple documents", async () => {
    const lastErrorObject = await db.a.update(
      { type: "water" },
      { $set: { type: "aqua" } },
      { multi: true }
    );
    expect(lastErrorObject.n).to.equal(3);

    const updatedDocsCount = await db.a.count({ type: "aqua" });
    expect(updatedDocsCount).equal(3);

    const idleDocsCount = await db.a.count({ type: "water" });
    expect(idleDocsCount).equal(0);
  });

  it("should replace a document", async () => {
    const bulbasaurLevel9 = {
      name: "Bulbasaur",
      type: "grass",
      level: 9,
    };
    const bulbasaurLevel10 = Object.assign({}, bulbasaurLevel9, { level: 10 });
    const upsertedReplace = await db.a.replaceOne(
      bulbasaurLevel9,
      bulbasaurLevel10,
      { upsert: true }
    );
    expect(upsertedReplace.matchedCount).to.equal(0);
    expect(upsertedReplace.modifiedCount).to.equal(0);
    expect(upsertedReplace.upsertedId).to.exist;

    const replaced = await db.a.replaceOne(bulbasaurLevel10, bulbasaurLevel10);
    expect(replaced.matchedCount).equal(1);
    expect(replaced.modifiedCount).equal(1);
    expect(replaced.upsertedId).to.not.exist;
  });

  it("should save a document", async () => {
    const doc = await db.a.save({ name: "Charizard", type: "fire" });

    expect(doc._id).to.exist;
    expect(doc.name).to.equal("Charizard");

    doc.type = "flying";

    const updatedDoc = await db.a.save(doc);

    expect(updatedDoc._id).to.exist;
    expect(updatedDoc.type).to.equal("flying");
  });

  it("should remove one", async () => {
    const lastErrorObject = await db.a.remove({ type: "water" }, true);
    expect(lastErrorObject.n).to.equal(1);

    const remainingDocs = await db.a.count({ type: "water" });
    expect(remainingDocs).to.equal(2);
  });

  it("should remove many", async () => {
    const lastErrorObject = await db.a.remove({ type: "water" });
    expect(lastErrorObject.n).to.equal(3);

    const remainingDocs = await db.a.count({ type: "water" });
    expect(remainingDocs).to.equal(0);
  });

  it("should delete one", async () => {
    const lastErrorObject = await db.a.deleteOne({ type: "water" });
    expect(lastErrorObject.deletedCount).to.equal(1);

    const remainingDocs = await db.a.count({ type: "water" });
    expect(remainingDocs).to.equal(2);
  });

  it("should delete many", async () => {
    const lastErrorObject = await db.a.deleteMany({ type: "water" });
    expect(lastErrorObject.deletedCount).to.equal(3);

    const remainingDocs = await db.a.count({ type: "water" });
    expect(remainingDocs).to.equal(0);
  });

  it("should rename a collection", async () => {
    await db.a.rename("b");

    const bDocs = await db.b.count({});
    expect(bDocs).to.equal(4);
  });

  it("should drop a collection", async () => {
    await db.a.drop();

    const docs = await db.a.count({});
    expect(docs).to.equal(0);
  });

  it("should get stats of a collection", async () => {
    const stats = await db.a.stats();

    expect(stats).to.exist;
    expect(stats.count).to.equal(4);
  });

  it("should return a string representation when calling toString", async () => {
    const collectionToString = await db.a.toString();

    expect(collectionToString).to.equal("a");
  });

  it("should ensure, create list and drop indexes and reIndex for a collection", async () => {
    await db.a.ensureIndex({ type: 1 });
    const indexes = await db.a.getIndexes();

    expect(indexes).to.have.length(2);

    await db.a.dropIndexes();

    const remainingIndexes = await db.a.getIndexes();
    expect(remainingIndexes).to.have.length(1);

    await db.a.createIndex({ type: 1 });
    const indexesAfterCreate = await db.a.getIndexes();

    expect(indexesAfterCreate).to.have.length(2);

    await db.a.dropIndex({ type: 1 });
    const indexesAfterDropOne = await db.a.getIndexes();

    expect(indexesAfterDropOne).to.have.length(1);

    await db.a.reIndex();

    const indexesAfterReindex = await db.a.getIndexes();
    expect(indexesAfterReindex).to.have.length(1);
  });

  it("should isCapped for a collection", async () => {
    await db.createCollection("mycappedcol", { capped: true, size: 1024 });

    const isCapped = await db.mycappedcol.isCapped();
    expect(isCapped).to.be.true;

    const isACapped = await db.a.isCapped();
    expect(isACapped).to.be.false;
  });

  it("should aggregate documents", async () => {
    const types = await db.a.aggregate([
      { $group: { _id: "$type" } },
      { $project: { _id: 0, foo: "$_id" } },
    ]);

    expect(types.length).to.equal(2);
    expect(types).to.deep.include({ foo: "fire" });
    expect(types).to.deep.include({ foo: "water" });
  });

  it("should not mutate write options", async () => {
    const mockDb = mongoist(connectionString);
    mockDb.connection = {
      collection: async () => {
        return {
          insertOne: async (docs, options) => {
            expect(options).to.deep.equal({
              writeConcern: { w: 1 },
              ordered: true,
            });
            options.foo = "bar";
          },
        };
      },
    };
    await mockDb.b.insert({ foo: "bar" });
    await mockDb.b.insert({ foo: "baz" });
  });

  it("should support ObjectId without constructor", async () => {
    const id = mongoist.ObjectId();
    await db.a.insert({ _id: id });
    const docs = await db.a.find({ _id: id });
    expect(docs).to.have.length(1);
    console.log(typeof docs[0]._id);
  });

  it("should support ObjectId with constructor", async () => {
    const id = new mongoist.ObjectId();
    await db.a.insert({ _id: id });
    const docs = await db.a.find({ _id: id });
    expect(docs).to.have.length(1);
    console.log(typeof docs[0]._id);
  });
});
