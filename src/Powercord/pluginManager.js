const { resolve } = require('path');
const { readdirSync } = require('fs');

const manifestKeys = [ 'name', 'version', 'description', 'author', 'license', 'repo' ];
const enforcedPlugins = [ 'pc-styleManager', 'pc-settings', 'pc-pluginManager' ];

module.exports = class PluginManager {
  constructor () {
    this.requiresReload = false;
    this.pluginDir = resolve(__dirname, 'plugins');
    this.ensuredPlugins = [];
  }

  get (plugin) {
    return this.plugins.get(plugin);
  }

  enable (plugin) {
    this.requiresReload = true;
    powercord.settings.set(
      'disabledPlugins',
      powercord.settings.get('disabledPlugins', []).filter(p => p !== plugin)
    );
  }

  disable (plugin) {
    if (enforcedPlugins.includes(plugin)) {
      throw new Error(`You cannot disable an enforced plugin. (Tried to disable ${plugin})`);
    }
    this.requiresReload = true;
    const disabled = powercord.settings.get('disabledPlugins', []);
    disabled.push(plugin);
    powercord.settings.set('disabledPlugins', disabled);
  }

  startPlugins () {
    this._loadPlugins();
    for (const plugin of [ ...this.plugins.values() ]) {
      if (powercord.settings.get('disabledPlugins', []).includes(plugin.pluginID)) {
        return;
      }
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

  resolveDeps (plugin) {
    const deps = [];
    plugin.options.dependencies.forEach(dep => {
      deps.push(dep, ...this.resolveDeps(dep));
    });
    return deps;
  }

  _loadPlugins () {
    const plugins = {};
    readdirSync(this.pluginDir)
      .forEach(filename => {
        const moduleName = filename.split('.')[0];

        let manifest;
        try {
          manifest = require(resolve(this.pluginDir, filename, 'manifest.json'));
        } catch (e) {
          return console.error('%c[Powercord]', 'color: #257dd4', `Plugin ${moduleName} doesn't have a valid manifest - Skipping`);
        }

        if (!manifestKeys.every(key => manifest.hasOwnProperty(key))) {
          return console.error('%c[Powercord]', 'color: #257dd4', `Plugin "${moduleName}" doesn't have a valid manifest - Skipping`);
        }

        try {
          const PluginClass = require(resolve(this.pluginDir, filename));

          Object.defineProperties(PluginClass.prototype, {
            pluginID: {
              get () {
                return moduleName;
              },
              set () {
                throw new Error('Plugins cannot update their ID at runtime!');
              }
            },
            manifest: {
              get () {
                return manifest;
              },
              set () {
                throw new Error('Plugins cannot update manifest at runtime!');
              }
            }
          });

          plugins[moduleName] = new PluginClass();
        } catch (e) {
          console.error('%c[Powercord]', 'color: #257dd4', `An error occurred while initializing "${moduleName}"!`, e);
        }
      });

    this.plugins = new Map(Object.entries(plugins));
    this._ensureDepsEnabled();
  }

  _ensureDepsEnabled () {
    this.plugins.forEach(plugin => {
      if (powercord.settings.get('disabledPlugins', []).includes(plugin.pluginID)) {
        if (enforcedPlugins.includes(plugin.pluginID)) { // :reee:
          this.enable(plugin.pluginID);
          this.requiresReload = false;
        } else {
          return;
        }
      }

      this._ensureDepEnabled(plugin);
    });
  }

  _ensureDepEnabled (plugin) {
    if (!this.ensuredPlugins.includes(plugin)) { // Prevent cyclic loops
      this.ensuredPlugins.push(plugin);
      plugin.options.dependencies.forEach(dep => {
        this.enable(dep);
        this.requiresReload = false;
        this._ensureDepsEnabled(dep);
      });
    }
  }
};
