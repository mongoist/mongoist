const mongodb = require('mongodb');
const Database = require('./lib/database');
const Collection = require('./lib/collection');
const Cursor = require('./lib/cursor');
const Bulk = require('./lib/bulk');

function isValidCollectionName(name) {
  return typeof name === 'string' && name &&
    !(name.includes('$') || name.includes('\0') || name.startsWith('system.'));
}

module.exports = function(connectionString, options) {
  const db = new Database(connectionString, options);
  const dbMethods = Object.create(null);

  return new Proxy(db, {
    get: function(obj, prop) {
      const dbProp = obj[prop];

      if (typeof dbProp === 'function') {
        //lazily cache function bound to underlying db
        dbMethods[prop] = dbMethods[prop] || dbProp.bind(db);
        return dbMethods[prop];
      }

      if (isValidCollectionName(prop)) {
        return db.collection(prop);
      }

      return dbProp;
    }
  });
}

// expose prototypes
module.exports.Database = Database
module.exports.Collection = Collection
module.exports.Cursor = Cursor
module.exports.Bulk = Bulk

// expose bson stuff visible in the shell
module.exports.Binary = mongodb.Binary
module.exports.Code = mongodb.Code
module.exports.DBRef = mongodb.DBRef
module.exports.Double = mongodb.Double
module.exports.Long = mongodb.Long
module.exports.NumberLong = mongodb.Long // Alias for shell compatibility
module.exports.MinKey = mongodb.MinKey
module.exports.MaxKey = mongodb.MaxKey
module.exports.ObjectID = mongodb.ObjectID
module.exports.ObjectId = mongodb.ObjectId
module.exports.Symbol = mongodb.Symbol
module.exports.Timestamp = mongodb.Timestamp

// Add support for default ES6 module imports
module.exports.default = module.exports