const mongodb = require('mongodb');
const Database = require('./lib/database');
const Collection = require('./lib/collection');
const Cursor = require('./lib/cursor');
const Bulk = require('./lib/bulk');

module.exports = function(connectionString, options) {
  const db = new Database(connectionString, options);

  return new Proxy(db, {
    get: function(obj, prop) {
      const dbProp = obj[prop];

      if (dbProp !== undefined) {
        return dbProp;
      }

      if (typeof prop === 'symbol') {
        return db[prop];
      }

      return db.collection(prop);
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