const { expect } = require('chai');
const dropMongoDbCollections = require('drop-mongodb-collections');
const mongoist = require('../');

const connectionString = 'mongodb://localhost/test';

describe('database', function() {
  this.timeout(5000);

  beforeEach(dropMongoDbCollections(connectionString));

  it('should not proxy symbols to collections', () => {
    if (typeof Symbol.toStringTag == 'undefined') {
      // skip test if not defined
      return;
    }

    const  db = mongoist(connectionString);

    const noCollection = db[Symbol.toStringTag];

    expect(noCollection).to.not.exist;
  });

  it('should export prototypes', () => {
    expect(mongoist.Database).to.exist;
    expect(mongoist.Collection).to.exist;
    expect(mongoist.Cursor).to.exist;
    expect(mongoist.Bulk).to.exist;
  });
});