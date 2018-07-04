const { expect } = require('chai');
const { Writable } = require('stream');

const dropMongoDbCollections = require('drop-mongodb-collections');
const mongoist = require('../');

const connectionString = 'mongodb://localhost:27017/test';

describe('cursor', function() {
  this.timeout(10000);

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

  afterEach(() => db.close());

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

  it('should return true for hasNext is documents are ready otherwise false', async() => {
    const cursor = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1);

    const hasNextBeforeFirst = await cursor.hasNext();
    expect(hasNextBeforeFirst).to.be.true;

    await cursor.next();

    // Exhausted cursor!
    const noNext = await cursor.hasNext();
    expect(noNext).to.be.false;

    await cursor.next();

    const definitelyNoNext = await cursor.hasNext();
    expect(definitelyNoNext).to.be.false;
  });


  it('should sort cursors', async() => {
    const sortedDocs = await db.a.findAsCursor()
      .sort({name: 1})
      .toArray();

    const sortedNames = sortedDocs.map(doc => doc.name);
    expect(sortedNames).to.deep.equal(['Charmander', 'Lapras', 'Squirtle', 'Starmie']);
  });

  it('should rewind a cursor', async() => {
    const cursor = db.a.findAsCursor().sort({name: 1});

    const obj1 = await cursor.next();
    expect(obj1.name).to.equal('Charmander');

    const obj2 = await cursor.next();
    expect(obj2.name).to.equal('Lapras');

    await cursor.rewind();

    const obj3 = await cursor.next();
    expect(obj3.name).to.equal('Charmander');
  });

  it('should iterate a cursor with forEach', async () => {
    let i = 0;

    await db.a.findAsCursor().forEach((pkm) => {
      expect(pkm.name).to.exist;
      expect(pkm.type).to.exist;

      i++;
    });

    expect(i).to.equal(4);
  });

  it('should map a cursor with map', async () => {
    const names = await db.a.findAsCursor()
      .sort({ name: 1})
      .map((pkm) => pkm.name);

    expect(names).to.deep.equal(['Charmander', 'Lapras', 'Squirtle', 'Starmie']);
  });

  it('should pass projections to findAsCursor', async () => {
    const docs = await db.a.findAsCursor({}, { name: true, _id: false })
      .toArray();

    expect(docs).to.have.length(4);
    expect(docs).to.deep.include({ name: 'Charmander' });
    expect(docs).to.deep.include({ name: 'Lapras' });
    expect(docs).to.deep.include({ name: 'Squirtle' });
    expect(docs).to.deep.include({ name: 'Starmie' });
  });

  it('should return null for next if the cursor was closed', async() => {
    const cursor = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1);

    await cursor.close();

    const document = await cursor.next();
    expect(document).to.not.exist;
  });

  it('should return null for next if the cursor was destroyed (alias of close)', async() => {
    const cursor = await db.a.findAsCursor({})
      .sort({ name : 1})
      .limit(1);

    await cursor.destroy();

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

  it('should stream a cursor', async () => {
    const cursor = db.a.findAsCursor();
    let runs = 0

    const loop = () => {
      let doc;

      while ((doc = cursor.read()) !== null) {

        expect(doc.name).to.be.oneOf(['Squirtle', 'Starmie', 'Charmander', 'Lapras']);
        expect(doc).to.be.a('object');

        runs++
      }

      cursor.once('readable', loop);
    }

    loop();

    return new Promise((resolve) => {
      cursor.on('end', function () {
        expect(runs).to.equal(4);

        resolve();
      });
    });
  });

  it('should pipe documents', async () => {
    const out = new ToArrayStream();

    return new Promise((resolve) => {
      db.a.findAsCursor()
        .pipe(out)
        .on('finish', () => {
          expect(out._data).to.have.length(4);

          resolve();
        });
    });
  });

  it('should emit a close event when closed', async () => {
    const cursor = db.a.findAsCursor();
    return new Promise((resolve) => {
      cursor.once('close', resolve);
      cursor.close();
    });
  });
});


class ToArrayStream  extends Writable {
  constructor() {
    super({objectMode: true, highWaterMark: 0});

    this._data = [];
  }

  _write(chunk, encoding, cb) {
    this._data.push(chunk);

    cb();
  }
}
