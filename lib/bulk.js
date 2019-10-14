const mongodb = require('mongodb');
const FindSyntax = require('./findSyntax');
const maxBulkSize = 1000;

const oid = mongodb.ObjectID.createPk;

class Bulk {
  constructor(colName, ordered, connect, opts) {
    this.colName = colName;
    this.ordered = ordered;
    this.connect = connect;

    opts = opts || { writeConcern: { w: 1 } };
    this.writeConcern = opts.writeConcern || { w: 1 };

    this.cmds = [];

    this.cmdKeys = {
      insert: 'nInserted',
      delete: 'nRemoved',
      update: 'nUpserted'
    };
  }

  ensureCommand(cmdName, bulkCollection) {
    if (this.currentCmd && (!this.currentCmd[cmdName] || this.currentCmd[bulkCollection].length === maxBulkSize)) {
      this.cmds.push(this.currentCmd);
      this.currentCmd = null;
    }

    if (!this.currentCmd) {
      this.currentCmd = {
        [cmdName]: this.colName,
        [bulkCollection]: [],
        ordered: this.ordered,
        writeConcern: this.writeConcern
      };
    }

    return this.currentCmd;
  }

  find(q) {
    let upsert = false;

    const remove = (limit) => {
      const cmd = this.ensureCommand('delete', 'deletes');
      cmd.deletes.push({ q, limit });
    };

    const update = (u, multi) => {
      const cmd = this.ensureCommand('update', 'updates');
      cmd.updates.push({ q, u, multi, upsert });
    };

    return new FindSyntax({
      update,
      upsert(upsertValue) { upsert = upsertValue; },
      remove
    });
  }

  insert(doc) {
    const cmd = this.ensureCommand('insert', 'documents');

    doc._id = doc._id || oid();
    cmd.documents.push(doc);
  }

  execute() {
    this.pushCurrentCmd();

    const result = {
      writeErrors: [],
      writeConcernErrors: [],
      nInserted: 0,
      nUpserted: 0,
      nMatched: 0,
      nModified: 0,
      nRemoved: 0,
      upserted: []
    };

    const setResult = (cmd, cmdResult) => {
      const cmdKey = Object.keys(cmd)[0];
      result[this.cmdKeys[cmdKey]] += cmdResult.n;
    };

    return this
      .connect()
      .then((connection) => each(this.cmds, (cmd) => connection.command(cmd).then((cmdResult) => setResult(cmd, cmdResult))))
      .then(() => {
        result.ok = 1;

        return result;
      });
  }

  pushCurrentCmd() {
    if (this.currentCmd) {
      this.cmds.push(this.currentCmd);
    }
  }

  tojson() {
    if (this.currentCmd) {
      this.cmds.push(this.currentCmd);
    }

    const obj = {
      nInsertOps: 0,
      nUpdateOps: 0,
      nRemoveOps: 0,
      nBatches: this.cmds.length
    };

    this.cmds.forEach(function(cmd) {
      if (cmd.update) {
        obj.nUpdateOps += cmd.updates.length;
      } else if (cmd.insert) {
        obj.nInsertOps += cmd.documents.length;
      } else if (cmd.delete) {
        obj.nRemoveOps += cmd.deletes.length;
      }
    });

    return obj;
  }

  toString() {
    return JSON.stringify(this.tojson());
  }
}

// TODO: This implementation is a bit whacky recursive implementation. PR anyone?
function each(cmds, executeCmd, idx) {
  idx = idx || 0;

  if (idx < cmds.length) {
    return executeCmd(cmds[idx]).then(() => each(cmds, executeCmd, idx + 1));
  }

  return Promise.resolve();
}

module.exports = Bulk;
