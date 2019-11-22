const { Readable } = require('stream');

class Cursor extends Readable {
  constructor(cursorFactory) {
    super({objectMode: true, highWaterMark: 0});

    this.cursorFactory = cursorFactory;

    // Currently mongodb cursor options itcount, readPref, showDiskLoc are not implemented - and some other
    // See https://docs.mongodb.com/manual/reference/method/js-cursor/
    const operations = ['batchSize', 'hint', 'limit', 'maxTimeMS', 'max', 'min', 'skip', 'snapshot', 'sort']

    this._options = {};
    this._flags = {};

    operations.forEach((operation) => {
      Cursor.prototype[operation] = (data) => {
        this._options[operation] = data;
        return this;
      }
    });
  }

  map(fn) {
    const result = []

    return new Promise((resolve) => {
      const loop = () => {
        this.next()
          .then(doc => {
            if (!doc) { return resolve(result); }

            result.push(fn(doc));

            // Avoid maximum call stack size exceeded errors
            setImmediate(loop);
          });
      }

      loop();
    });
  }

  forEach(fn) {
    return new Promise((resolve) => {
      const loop = () => {
        this.next()
          .then(doc => {
            if (!doc) { return resolve(); }

            fn(doc);

            // Avoid maximum call stack size exceeded errors
            setImmediate(loop);
          });
      }

      loop();
    });
  }

  count() {
    return this.getCursor().then(cursor => cursor.count(false, this._options));
  }

  size() {
    return this.getCursor().then(cursor => cursor.count(true, this._options));
  }

  explain() {
    return this.getCursor().then(cursor => cursor.explain());
  }

  destroy() {
    return this.close();
  }

  close() {
    return this.getCursor().then(cursor => cursor.close());
  }

  next() {
    return this.getCursor().then(cursor => {
      if (cursor.cursorState.dead || cursor.cursorState.killed) {
        return null;
      }

      return cursor.next();
    });
  }

  hasNext() {
    return this.getCursor().then(cursor => !cursor.isClosed() && cursor.hasNext());
  }

  rewind() {
    return this.getCursor().then(cursor => cursor.rewind());
  }

  toArray() {
    return this.getCursor().then(cursor => cursor.toArray());
  }

  addCursorFlag(flag, value) {
    this._flags[flag] = value;
    return this;
  }

  _read() {
    return this.next()
      .then(doc => this.push(doc))
      .catch(err => this.emit('error', err));
  }


  getCursor() {
    if (this.cursor) {
      return Promise.resolve(this.cursor);
    }

    return this
      .cursorFactory()
      .then(cursor => {
        Object.keys(this._options).forEach(key => {
          cursor = cursor[key](this._options[key]);
        });
        Object.keys(this._flags).forEach(key => {
          cursor.addCursorFlag(key, this._flags[key]);
        });

        cursor.on('close', (...args) => this.emit('close', ...args));

        this.cursor = cursor;

        return cursor;
      });
  }
}

// Feature-detect async iterator protocol support, only available in Node 10+.
if (typeof Symbol.asyncIterator === 'symbol') {
  Cursor.prototype[Symbol.asyncIterator] = function() {
    const next = () => this.next().then((doc) => ({ value: doc || undefined, done: !doc }));
    return { next };
  };
}

module.exports = Cursor;
