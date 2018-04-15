const { join } = require('path');

const pluginDir = join(__dirname, 'plugins');
const Store = require('aethcord/Structures/Store.js');

module.exports = class PluginStore extends Store {
  constructor (main) {
    super(main, pluginDir);
  }

  async init () {
    return Promise.all([...this.store.values()].map(g => g._load()));
  }

  async addItem (path) {
    const Plugin = new (require(path))(this.main);
    this.store.set(path, Plugin);
  }

  async removeItem (path) {
    await this.store.get(path)._unload();
    delete require.cache[require.resolve(path)];
  }
};
