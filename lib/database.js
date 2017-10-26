const { EventEmitter } = require('events');
const mongodb = require('mongodb');

const Collection = require('./collection');

module.exports = class Database extends EventEmitter {
  constructor(connectionString, options) {
    super();

    if (typeof connectionString == 'string') {
        // Fix short cut connection URLs consisting only of a db name or db + host
        if (connectionString.indexOf('/') < 0) {
          connectionString = 'localhost/' + connectionString
        }

        if (connectionString.indexOf('mongodb://') < 0) {
          connectionString = 'mongodb://' + connectionString
        }
    }

    this.connectionString = connectionString;
    this.options = options || {};

    // Define the property to not confuse the proxy
    this.connection = null;
  }

  createCollection(name, opts) {
    const cmd = Object.assign({ create: name }, opts);

    return this.runCommand(cmd);
  }

  getCollectionInfos() {
    return this.connect()
      .then(connection => connection.listCollections().toArray())
      .then(collectionInfos => collectionInfos.filter(ci => !ci.name.startsWith('system.')))
  }

  listCollections() {
    return this.getCollectionInfos();
  }

  getCollectionNames() {
    return this.listCollections().then(collections => collections.map((collection) => collection.name));
  }

  runCommand(opts) {
    if (typeof opts === 'string') {
      opts = {
        [opts]: 1 };
    }

    return this
      .connect()
      .then(connection => connection.command(opts));
  }

  stats(scale) {
    return this.runCommand({ dbStats: 1, scale: scale });
  }

  createUser(usr) {
    const cmd = Object.assign({ createUser: usr.user }, usr);
    delete cmd.user;

    return this.runCommand(cmd);
  }

  dropUser(username) {
    return this.runCommand({ dropUser: username });
  }

  dropAllUsers() {
    return this.runCommand({ dropAllUsersFromDatabase: 1 });
  }

  dropDatabase() {
    return this.runCommand('dropDatabase');
  }

  getLastErrorObj() {
    return this.runCommand('getLastError');
  }

  getLastError() {
    return this
      .runCommand('getLastError')
      .then(res => res.err);
  }

  connect() {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }

    if (typeof this.connectionString == 'string') {
      return mongodb.MongoClient
        .connect(this.connectionString, this.options)
        .then(connection => {
          this.connection = connection;
          this.emit('connect');

          return connection;
        })
        .catch(e => {
          this.emit('error', e);

          throw e;
        });
    } else if (typeof this.connectionString._getConnection === 'function') { // mongojs
      return new Promise((resolve, reject) => {
        this.connectionString._getConnection((err, connection) => {
          if (err) { return reject(err); }

          this.connection = connection;
          this.emit('connect');

          resolve(connection);
        });
      });
    } else if (this.connectionString instanceof Database) { // mongoist
      return this.connectionString.connect().then((connection) => {
        this.connection = connection;
        return connection;
      });
    }
  }

  close(force) {
    return this
      .connect()
      .then(connection => connection.close(force));
  }

  collection(collection) {
    return new Collection(this, collection);
  }
}