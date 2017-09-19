const { expect } = require('chai');
const dropMongoDbCollections = require('drop-mongodb-collections');
const mongoist = require('../');

const connectionString = 'mongodb://localhost/test';

describe('cursor', function() {
  this.timeout(5000);

  let db;

  beforeEach(dropMongoDbCollections(connectionString));
  beforeEach(async() => {
    db = mongoist(connectionString);

    await db.a.insert([{
      name: 'Squirtle', type: 'water', level: 10,
    }, {
      name: 'Starmie', type: 'water', level: 8,
    }, {
      name: 'Charmander', type: 'fire', level: 8,
    }, {
      name: 'Lapras', type: 'water', level: 12,
    }]);
  });

  it('should return cursor count', async() => {
    const count = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1)
      .count();

    expect(count).to.equal(1);
  });

  it('should return cursor size', async() => {
    const size = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1)
      .size();

    expect(size).to.equal(1);
  });

  it('should explain a cursor', async() => {
    const explained = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1)
      .explain();

    expect(explained).to.exist;
  });

  it('should close a cursor', async() => {
    await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1)
      .close();
  });

  it('should iterate a cursor with next', async() => {
    const cursor = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1);

    const document = await cursor.next();
    expect(document).to.exist;

    // Exhausting cursor!
    const nonExisting = await cursor.next();
    expect(nonExisting).to.not.exist;
  });

  it('should return null for next if the cursor was closed', async() => {
    const cursor = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1);

    await cursor.close();

    const document = await cursor.next();
    expect(document).to.not.exist;
  });

  it('should allow multiple operations on one cursor', async() => {
    const cursor = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1);

    const arr = await cursor.toArray();
    expect(arr).to.exist;

    const count = await cursor.count();
    expect(count).to.equal(1);

    await cursor.close();
  });
});