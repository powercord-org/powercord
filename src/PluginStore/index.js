const { readdirSync } = require('fs');
const { watch } = require('chokidar');
const { join, isAbsolute } = require('path');

const pluginDir = join(__dirname, 'plugins');

module.exports = class PluginStore {
  constructor (main) {
    this.main = main;
    this.store = new Map();

    this.setup();
  }

  async loadPlugin (filename) {
    console.log(filename);
    if (!isAbsolute(filename)) {
      filename = join(pluginDir, filename);
    }

    if (this.store.has(filename)) {
      console.log(this.store.get(filename));
      this.store.get(filename).unload.call(this.main);
      delete require.cache[require.resolve(filename)];
    }

    const plugin = require(filename);
    this.store.set(filename, plugin);
    plugin.init.call(this.main);
  }

  async setup () {
    readdirSync(pluginDir).map(this.loadPlugin, this);
    watch(pluginDir)
      .on('change', this.loadPlugin.bind(this));
  }
};
