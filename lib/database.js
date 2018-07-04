const { EventEmitter } = require('events');
const mongodb = require('mongodb');
const urlParser = require('mongodb/lib/url_parser.js');
const Collection = require('./collection');
const debug = require('debug')('mongoist');

module.exports = class Database extends EventEmitter {
  constructor(connectionString, options) {
    super();

    if (typeof connectionString == 'string') {
        // Fix short cut connection URLs consisting only of a db name or db + host
        if (connectionString.indexOf('/') < 0) {
          connectionString = 'localhost:27017/' + connectionString
        }

        if (connectionString.indexOf('mongodb://') < 0 && connectionString.indexOf('mongodb+srv://') < 0) {
          connectionString = 'mongodb://' + connectionString
        }
    }

    this.connectionString = connectionString;
    this.options = options || {};

    // Define the property to not confuse the proxy
    this.connection = null;
    this.features = null;
    this.client = null;
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
      return parseUrl(this.connectionString, this.options)
        .then(parsedUrl => parsedUrl.dbName)
        .then(dbName => {
          return mongodb.MongoClient
            .connect(this.connectionString, { useNewUrlParser: true }, this.options)
            .then(client => {

              this.client = client;
              this.connection = client.db(dbName);

              this.features = {
                useLegacyProjections: false
              };

              this.emit('connect');

              return this.connection;
            })
            .catch(e => {
              this.emit('error', e);

              throw e;
            });
        });
    } else if (typeof this.connectionString._getConnection === 'function') { // mongojs
      return new Promise((resolve, reject) => {
        this.connectionString._getConnection((err, connection) => {
          if (err) { return reject(err); }

          this.connection = connection;

          this.features = {
            useLegacyProjections: true
          };

          this.emit('connect');

          resolve(this.connection);
        });
      });
    } else if (this.connectionString instanceof Database) { // mongoist
      return this.connectionString.connect().then((connection) => {
        this.connection = connection;

        this.features = {
          useLegacyProjections: false
        };

        this.emit('connect');

        return this.connection;
      });
    }
  }

  close(force) {
    return this
      .connect()
      .then(connection => {

        if (this.client) {
          return this.client
            .close(force)
            .catch((e) => {
              // Ignore this
              debug(`Could not close the connection due to error "${e.message}" ${e.stack}`);
            });
        }

        if (connection.close) {
          return this.connection
            .close(force)
            .catch((e) => {
              // Ignore this
              debug(`Could not close the connection due to error "${e.message}" ${e.stack}`);
            });
        }
      });
  }

  collection(collection) {
    return new Collection(this, collection);
  }
}

function parseUrl(connectionString, options) {
  return new Promise((resolve, reject) => {
    urlParser(connectionString, options, (err, parsedUrl) => err?reject(err):resolve(parsedUrl))
  });
}