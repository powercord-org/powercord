const { join } = require('path');

const pluginDir = join(__dirname, 'plugins');
const Store = require(join(__dirname, '..', 'Structures', 'Store'));

module.exports = class PluginStore extends Store {
  constructor (main) {
    super(main, pluginDir);
  }

  async addItem (path) {
    const Plugin = new (require(path))(this.main);
    this.store.set(path, Plugin);
    Plugin._load();
  }

  async removeItem (path) {
    this.store.get(path)._unload();
    delete require.cache[require.resolve(path)];
  }
};
