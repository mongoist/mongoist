const { expect } = require("chai");
const dropMongoDbCollections = require("drop-mongodb-collections");
const mongoist = require("../");
const connectionString = "mongodb://localhost:27017/test";

describe("database", function () {
  this.timeout(10000);

  beforeEach(dropMongoDbCollections(connectionString));

  it("should not proxy symbols to collections", () => {
    if (typeof Symbol.toStringTag == "undefined") {
      // skip test if not defined
      return;
    }

    const db = mongoist(connectionString);

    const noCollection = db[Symbol.toStringTag];

    expect(noCollection).to.not.exist;
  });

  it("should export prototypes", () => {
    expect(mongoist.Database).to.exist;
    expect(mongoist.Collection).to.exist;
    expect(mongoist.Cursor).to.exist;
    expect(mongoist.Bulk).to.exist;
    expect(mongoist.ObjectId).to.exist;
    expect(mongoist.ObjectID).to.exist;
  });

  describe("ObjectId", () => {
    it("should support ObjectId without constructor", () => {
      const ObjectId = mongoist.ObjectId;
      const id = ObjectId();
      expect(id).to.exist;
    });

    it("should support ObjectId with constructor", () => {
      const ObjectId = mongoist.ObjectId;
      const id = new ObjectId();
      expect(id).to.exist;
    });

    it("should handle string IDs", () => {
      const hexString = "507f1f77bcf86cd799439011";
      const id = new mongoist.ObjectId(hexString);
      expect(id.toString()).to.equal(hexString);
    });

    it("should have same type as mongo ObjectId", () => {
      const mongoObjectId = require("mongodb").ObjectId;
      const mongoistObjectId = mongoist.ObjectId;

      expect(mongoistObjectId).to.equal(mongoObjectId);
      expect(typeof mongoistObjectId).to.equal(typeof mongoObjectId);
    });
  });
});
