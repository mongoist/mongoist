
class FindSyntax {
  constructor(cmds) {
    this.cmds = cmds;
  }

  upsert() {
    this.cmds.upsert(true);

    return this;
  }

  remove() {
    this.cmds.remove(0);
  }

  removeOne() {
    this.cmds.remove(1);
  }

  update(updObj) {
    this.cmds.update(updObj, true);
  }

  updateOne(updObj) {
    this.cmds.update(updObj, false);
  }

  replaceOne(updObj) {
    this.updateOne(updObj);
  }
}

module.exports = FindSyntax;
