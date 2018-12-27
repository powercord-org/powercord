const { resolve } = require('path');
const { readdirSync } = require('fs');

const manifestKeys = [ 'name', 'version', 'description', 'author', 'license', 'repo' ];

module.exports = class PluginManager {
  constructor () {
    this.requiresReload = false;
    this.pluginDir = resolve(__dirname, 'plugins');
  }

  get (plugin) {
    return this.plugins.get(plugin);
  }

  startPlugins () {
    this._loadPlugins();
    for (const plugin of [ ...this.plugins.values() ]) {
      if (
        (plugin.options.appMode === 'overlay' && window.__OVERLAY__) ||
        (plugin.options.appMode === 'app' && !window.__OVERLAY__) ||
        plugin.options.appMode === 'both'
      ) {
        plugin._start();
      } else {
        console.error('%c[Powercord]', 'color: #257dd4', `Plugin ${plugin.constructor.name} doesn't have a valid app mode - Skipping`);
        this.plugins.delete(plugin);
      }
    }
  }

  _loadPlugins () {
    const plugins = {};
    readdirSync(this.pluginDir)
      .forEach(filename => {
        const moduleName = filename.split('.')[0];
        let manifest;
        try {
          manifest = require(`${this.pluginDir}/${filename}/manifest.json`);
        } catch (e) {
          console.error('%c[Powercord]', 'color: #257dd4', `Plugin ${moduleName} doesn't have a valid manifest - Skipping`);
          return;
        }

        if (!manifestKeys.every(key => manifest.hasOwnProperty(key))) {
          console.error('%c[Powercord]', 'color: #257dd4', `Plugin "${moduleName}" doesn't have a valid manifest - Skipping`);
          return;
        }

        try {
          const PluginClass = require(`${this.pluginDir}/${filename}`);
          const plugin = new PluginClass();
          Object.defineProperty(plugin, 'manifest', {
            get () {
              return manifest;
            },
            set () {
              throw new Error('Plugins cannot update manifest at runtime!');
            }
          });

          plugins[moduleName] = plugin;
        } catch (e) {
          console.error('%c[Powercord]', 'color: #257dd4', `An error occurred while initializing "${moduleName}"!`, e);
        }
      });

    this.plugins = new Map(Object.entries(plugins));
  }
};
