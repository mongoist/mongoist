const { expect } = require('chai');
const dropMongoDbCollections = require('drop-mongodb-collections');
const mongoist = require('../');

const connectionString = 'mongodb://localhost:27017/test';

describe('bulk', function() {
  this.timeout(10000);

  let db;

  beforeEach(dropMongoDbCollections(connectionString));
  beforeEach(() => {
    db = mongoist(connectionString);
  });

  afterEach(() => db.close());

  it('should break excessive bulk operations in junks', async () => {
      const bulk = db.a.initializeOrderedBulkOp();
      const numberOfOp = 1066;

      for (let i = 0; i < numberOfOp; ++i) {
        bulk.insert({name: 'Spearow', type: 'flying'});
      }

      const res = await bulk.execute();

      expect(res.ok).to.equal(1);

      const docs = await db.a.find();
      expect(docs).to.have.length(numberOfOp);
  });

  it('should replace one using bulk', async() => {
    await db.a.insert([{
      name: 'Squirtle', type: 'water'
    }, {
      name: 'Starmie', type: 'water'
    }]);

    const bulk = db.a.initializeUnorderedBulkOp();
    bulk.find({ name: 'Squirtle' }).replaceOne({ name: 'Charmander', type: 'fire' });
    bulk.find({ name: 'Starmie' }).replaceOne({ type: 'fire' });

    const res = await bulk.execute();
    expect(res.ok).to.equal(1);

    const docs = await db.a.find();


    expect(docs[0].name).to.equal('Charmander');
    expect(docs[1].name).to.equal(undefined);

    expect(docs[0].type).to.equal('fire');
    expect(docs[1].type).to.equal('fire');
  });

  it('should update documents in bulk', async() => {
    await db.a.insert([{
      name: 'Squirtle', type: 'water'
    }, {
      name: 'Starmie', type: 'water'
    }, {
      name: 'Lapras', type: 'water'
    }, {
      name: 'Charmander', type: 'fire'
    }]);

    const bulk = db.a.initializeOrderedBulkOp()
    bulk.find({type: 'water'}).update({$set: {level: 1}})
    bulk.find({type: 'water'}).update({$inc: {level: 2}})
    bulk.insert({name: 'Spearow', type: 'flying'})
    bulk.insert({name: 'Pidgeotto', type: 'flying'})
    bulk.insert({name: 'Charmeleon', type: 'fire'})
    bulk.find({type: 'flying'}).removeOne()
    bulk.find({type: 'fire'}).remove()
    bulk.find({type: 'water'}).updateOne({$set: {hp: 100}})

    bulk.find({name: 'Squirtle'}).upsert().updateOne({$set: {name: 'Wartortle', type: 'water'}})
    bulk.find({name: 'Bulbasaur'}).upsert().updateOne({$setOnInsert: {name: 'Bulbasaur'}, $set: {type: 'grass', level: 1}})

    const res = await bulk.execute();
    expect(res.ok).to.equal(1);

    const docs = await db.a.find();

    expect(docs[0].name).to.equal('Wartortle')
    expect(docs[1].name).to.equal('Starmie')
    expect(docs[2].name).to.equal('Lapras')
    expect(docs[3].name).to.equal('Pidgeotto')
    expect(docs[4].name).to.equal('Bulbasaur')
    expect(docs[4].type).to.equal('grass')

    expect(docs[0].level).to.equal(3)
    expect(docs[1].level).to.equal(3)
    expect(docs[2].level).to.equal(3)
    expect(docs[4].level).to.equal(1)

    expect(docs[0].hp).to.equal(100);
  });

  it('should execute an empty bulk', async() => {
    await db.a.insert([{
      name: 'Squirtle', type: 'water'
    }, {
      name: 'Starmie', type: 'water'
    }, {
      name: 'Lapras', type: 'water'
    }, {
      name: 'Charmander', type: 'fire'
    }]);

    const bulk = db.a.initializeOrderedBulkOp()
    const res = await bulk.execute();
    expect(res.ok).to.equal(1);
  });

  it('should return a bulk json representation', async () => {
    await db.a.insert([{
      name: 'Squirtle', type: 'water'
    }, {
      name: 'Starmie', type: 'water'
    }, {
      name: 'Lapras', type: 'water'
    }, {
      name: 'Charmander', type: 'fire'
    }]);

    const bulk = db.a.initializeOrderedBulkOp();
    bulk.insert({ item: 'abc123', status: 'A', defaultQty: 500, points: 5 });
    bulk.insert({ item: 'ijk123', status: 'A', defaultQty: 100, points: 10 });
    bulk.find({ item: null }).update({ $set: { item: 'TBD' } });
    bulk.find({ status: 'D' }).removeOne();

    const result = bulk.tojson();
    expect(result.nInsertOps).to.equal(2, 'Should result in nInsertOps field set to 2');
    expect(result.nUpdateOps).to.equal(1, 'Should result in nUpdateOps field set to 1');
    expect(result.nRemoveOps).to.equal(1, 'Should result in nRemoveOps field set to 1');
    expect(result.nBatches).to.equal(3, 'Should result in nBatches field set to 3');
  });

  it('should return a bulk string representation', async () => {
    await db.a.insert([{
      name: 'Squirtle', type: 'water'
    }, {
      name: 'Starmie', type: 'water'
    }, {
      name: 'Lapras', type: 'water'
    }, {
      name: 'Charmander', type: 'fire'
    }]);

    const bulk = db.a.initializeOrderedBulkOp();
    bulk.insert({ item: 'abc123', status: 'A', defaultQty: 500, points: 5 });
    bulk.insert({ item: 'ijk123', status: 'A', defaultQty: 100, points: 10 });
    bulk.find({ item: null }).update({ $set: { item: 'TBD' } });
    bulk.find({ status: 'D' }).removeOne();

    const result = bulk.toString();
    expect(result).to.be.a('string');

    const json = JSON.parse(result);

    expect(json.nInsertOps).to.equal(2, 'Should result in nInsertOps field set to 2');
    expect(json.nUpdateOps).to.equal(1, 'Should result in nUpdateOps field set to 1');
    expect(json.nRemoveOps).to.equal(1, 'Should result in nRemoveOps field set to 1');
    expect(json.nBatches).to.equal(3, 'Should result in nBatches field set to 3');
  });
});