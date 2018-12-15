const EventEmitter = require('events');

const modules = require('./modules');

const isOverlay = location.pathname === '/overlay';

module.exports = class Powercord extends EventEmitter {
  constructor (config) {
    super();

    this.config = config;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init () {
    await Promise.all(modules.map(mdl => mdl()));
    this.startPlugins();
  }

  async startPlugins () {
    const plugins = new Map(Object.entries(require('./plugins')));
    this.plugins = plugins;

    for (const plugin of [ ...plugins.values() ]) {
      if (
        (plugin.options.appMode === 'overlay' && isOverlay) ||
        (plugin.options.appMode === 'app' && !isOverlay) ||
        plugin.options.appMode === 'both'
      ) {
        plugin._start();
      } else {
        plugins.delete(plugin);
      }
    }
  }
};
