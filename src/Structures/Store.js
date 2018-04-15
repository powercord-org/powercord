const { readdirSync } = require('fs');
const { watch } = require('chokidar');
const { join, isAbsolute } = require('path');

module.exports = class Store {
  constructor (main, dir) {
    this.main = main;
    this.dir = dir;

    this.store = new Map();
    this.setup();
  }

  handleItem (path) {
    if (!isAbsolute(path)) { // file paths from chokidar are absolute, files from fs.readdirSync are not
      path = join(this.dir, path);
    }

    if (this.store.has(path)) {
      this.removeItem(path);
    }

    return this.addItem(path);
  }

  async setup () {
    readdirSync(this.dir).map(this.handleItem, this);
    watch(this.dir)
      .on('change', this.handleItem.bind(this));
  }
};
