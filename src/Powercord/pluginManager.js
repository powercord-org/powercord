const { resolve } = require('path');
const { readdirSync } = require('fs');

module.exports = class PluginManager {
  constructor () {
    this._requiresReload = false;
    this.pluginDir = resolve(__dirname, 'plugins');
    this.ensuredPlugins = [];

    this.manifestKeys = [ 'name', 'version', 'description', 'author', 'license', 'repo' ];
    this.enforcedPlugins = [ 'pc-styleManager', 'pc-settings', 'pc-pluginManager', 'pc-keybindManager' ];
  }

  get requiresReload () {
    return this._requiresReload;
  }

  set requiresReload (value) {
    this._requiresReload = value;
    const title = document.querySelector('.pc-titleWrapper');
    if (title) {
      require('powercord/util').getOwnerInstance(title).forceUpdate();
    }
  }

  // Getters
  get (plugin) {
    return this.plugins.get(plugin);
  }

  getPlugins () {
    return Array.from(powercord.pluginManager.plugins.keys()).filter(p => !powercord.settings.get('hiddenPlugins', []).includes(p));
  }

  getHiddenPlugins () {
    return Array.from(powercord.pluginManager.plugins.keys()).filter(p => powercord.settings.get('hiddenPlugins', []).includes(p));
  }

  isEnabled (plugin) {
    return !powercord.settings.get('disabledPlugins', []).includes(plugin);
  }

  isEnforced (plugin) {
    return this.enforcedPlugins.includes(plugin);
  }

  resolveDependencies (plugin, deps = []) {
    let dependencies = [];
    if (plugin.startsWith('pc-')) {
      ({ dependencies } = this.get(plugin).manifest);
    } else {
      // If installed: local manifest, else: request to API
    }

    dependencies.forEach(dep => {
      if (!deps.includes(dep)) {
        deps.push(dep, ...this.resolveDependencies(dep));
      }
    });
    return deps;
  }

  // Enable/install/hide shit
  enable (plugin) {
    this.requiresReload = true;
    powercord.settings.set(
      'disabledPlugins',
      powercord.settings.get('disabledPlugins', []).filter(p => p !== plugin)
    );
  }

  disable (plugin) {
    if (this.enforcedPlugins.includes(plugin)) {
      throw new Error(`You cannot disable an enforced plugin. (Tried to disable ${plugin})`);
    }
    this.requiresReload = true;
    const disabled = powercord.settings.get('disabledPlugins', []);
    disabled.push(plugin);
    powercord.settings.set('disabledPlugins', disabled);
  }

  show (plugin) {
    powercord.settings.set(
      'hiddenPlugins',
      powercord.settings.get('hiddenPlugins', []).filter(p => p !== plugin)
    );
  }

  hide (plugin) {
    const disabled = powercord.settings.get('hiddenPlugins', []);
    disabled.push(plugin);
    powercord.settings.set('hiddenPlugins', disabled);
  }

  install (plugin) {
    this.requiresReload = true;
    console.log('soon:tm:');
  }

  uninstall (plugin) {
    if (this.enforcedPlugins.includes(plugin)) {
      throw new Error(`You cannot uninstall an enforced plugin. (Tried to uninstall ${plugin})`);
    }

    if (plugin.startsWith('pc-')) {
      throw new Error(`You cannot uninstall an internal plugin. (Tried to uninstall ${plugin})`);
    }

    this.requiresReload = true;
    console.log('soon:tm:');
  }

  // Start + internals
  startPlugins () {
    this._loadPlugins();
    for (const plugin of [ ...this.plugins.values() ]) {
      if (powercord.settings.get('disabledPlugins', []).includes(plugin.pluginID)) {
        return;
      }
      if (
        (plugin.manifest.appMode === 'overlay' && window.__OVERLAY__) ||
        (plugin.manifest.appMode === 'app' && !window.__OVERLAY__) ||
        plugin.manifest.appMode === 'both'
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
          manifest = Object.assign({
            appMode: 'app',
            dependencies: []
          }, require(resolve(this.pluginDir, filename, 'manifest.json')));
        } catch (e) {
          return console.error('%c[Powercord]', 'color: #257dd4', `Plugin ${moduleName} doesn't have a valid manifest - Skipping`);
        }

        if (!this.manifestKeys.every(key => manifest.hasOwnProperty(key))) {
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
        if (this.enforcedPlugins.includes(plugin.pluginID)) { // :reee:
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
      plugin.manifest.dependencies.forEach(dep => {
        this.enable(dep);
        this.requiresReload = false;
        this._ensureDepsEnabled(dep);
      });
    }
  }
};
