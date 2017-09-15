module.exports = class Cursor {
  constructor(cursorFactory) {
    this.cursorFactory = cursorFactory;

    // Currently mongodb cursor options addOption, hasNext, itcount, readPref, showDiskLoc are not implemented
    const operations = ['batchSize', 'hint', 'limit', 'maxTimeMS', 'max', 'min', 'skip', 'snapshot', 'sort']

    this._options = {};

    operations.forEach((operation) => {
      Cursor.prototype[operation] = (data) => {
        this._options[operation] = data;
        return this;
      }
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

  toArray() {
    return this.getCursor().then(cursor => cursor.toArray());
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

        this.cursor = cursor;

        return cursor;
      });
  }
}