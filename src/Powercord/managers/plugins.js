/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { resolve } = require('path');
const { readdirSync } = require('fs');
const { get } = require('powercord/http');
const { rmdirRf } = require('powercord/util');
const { WEBSITE } = require('powercord/constants');

const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

module.exports = class PluginManager {
  constructor () {
    this.pluginDir = resolve(__dirname, '..', 'plugins');
    this.plugins = new Map();

    this.manifestKeys = [ 'name', 'version', 'description', 'author', 'license' ];
  }

  // Getters
  get (pluginID) {
    return this.plugins.get(pluginID);
  }

  async getPluginName (pluginID) {
    const plugin = this.get(pluginID);
    if (plugin) {
      return plugin.manifest.name;
    }

    // API request
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    try {
      return (await get(`${baseUrl}/api/plugins/${pluginID}`).then(r => r.body)).manifest.name || void 0;
    } catch (e) {
      return void 0;
    }
  }

  getPlugins () {
    return [ ...this.plugins.keys() ];
  }

  isInstalled (plugin) {
    return this.plugins.has(plugin);
  }

  isEnabled (plugin) {
    return !powercord.settings.get('disabledPlugins', []).includes(plugin);
  }


  // Dependency query
  getDependenciesLocal (pluginID) {
    const plugin = this.get(pluginID);

    if (plugin) {
      return plugin.manifest.dependencies || [];
    }

    return [];
  }

  // Resolvers
  resolveDependents (plugin, dept = []) {
    const dependents = this.getPlugins().filter(p => this.getDependenciesLocal(p).includes(plugin));
    dependents.forEach(dpt => {
      if (!dept.includes(dpt)) {
        dept.push(dpt);
        dept.push(...this.resolveDependents(dpt, dept));
      }
    });
    return dept.filter((d, p) => dept.indexOf(d) === p);
  }

  resolveDependencies (plugin, dept = []) {
    const dependencies = this.getDependenciesLocal(plugin);

    return dependencies
      .map(dep => {
        if (!dept.includes(dep)) {
          dept.push(dep)
          dept.push(...this.resolveDependencies(dep, dept))
        }
      })
      .filter((d, p) => deps.indexOf(d) === p);
  }

  // Mount/load/enable/install shit
  mount (pluginID) {
    let manifest;
    try {
      manifest = Object.assign({
        appMode: 'app',
        dependencies: [],
        optionalDependencies: []
      }, require(resolve(this.pluginDir, pluginID, 'manifest.json')));
    } catch (e) {
      return console.error('%c[Powercord]', 'color: #257dd4', `Plugin ${pluginID} doesn't have a valid manifest - Skipping`);
    }

    if (!this.manifestKeys.every(key => manifest.hasOwnProperty(key))) {
      return console.error('%c[Powercord]', 'color: #257dd4', `Plugin "${pluginID}" doesn't have a valid manifest - Skipping`);
    }

    try {
      const PluginClass = require(resolve(this.pluginDir, pluginID));

      Object.defineProperties(PluginClass.prototype, {
        pluginID: {
          get: () => pluginID,
          set: () => {
            throw new Error('Plugins cannot update their ID at runtime!');
          }
        },
        manifest: {
          get: () => manifest,
          set: () => {
            throw new Error('Plugins cannot update manifest at runtime!');
          }
        }
      });

      this.plugins.set(pluginID, new PluginClass());
    } catch (e) {
      console.error('%c[Powercord:Plugin]', 'color: #257dd4', `An error occurred while initializing "${pluginID}"!`, e);
    }
  }

  async remount (pluginID) {
    try {
      await this.unmount(pluginID);
    } catch (e) {
      // chhhh
    }
    this.mount(pluginID);
    this.plugins.get(pluginID)._load();
  }

  async unmount (pluginID) {
    const plugin = this.get(pluginID);
    if (!plugin) {
      throw new Error(`Tried to unmount a non installed plugin (${plugin})`);
    }
    if (plugin.ready) {
      await plugin._unload();
    }

    Object.keys(require.cache).forEach(key => {
      if (key.includes(pluginID)) {
        delete require.cache[key];
      }
    });
    this.plugins.delete(pluginID);
  }

  // Load
  load (pluginID) {
    const plugin = this.get(pluginID);
    if (!plugin) {
      throw new Error(`Tried to load a non installed plugin (${plugin})`);
    }
    if (plugin.ready) {
      return console.error('%c[Powercord]', 'color: #257dd4', `Tried to load an already loaded plugin (${pluginID})`);
    }

    plugin._load();
  }

  unload (pluginID) {
    const plugin = this.get(pluginID);
    if (!plugin) {
      throw new Error(`Tried to unload a non installed plugin (${plugin})`);
    }
    if (!plugin.ready) {
      return console.error('%c[Powercord]', 'color: #257dd4', `Tried to unload a non loaded plugin (${plugin})`);
    }

    plugin._unload();
  }

  // Enable
  enable (pluginID) {
    if (!this.get(pluginID)) {
      throw new Error(`Tried to enable a non installed plugin (${pluginID})`);
    }

    powercord.settings.set(
      'disabledPlugins',
      powercord.settings.get('disabledPlugins', []).filter(p => p !== pluginID)
    );

    this.load(pluginID);
  }

  disable (pluginID) {
    const plugin = this.get(pluginID);

    if (!plugin) {
      throw new Error(`Tried to disable a non installed plugin (${pluginID})`);
    }

    powercord.settings.set('disabledPlugins', [
      ...powercord.settings.get('disabledPlugins', []),
      pluginID
    ]);

    this.unload(pluginID);
  }

  // Install
  async install (pluginID) {
    await exec(`git clone https://github.com/powercord-org/${pluginID}`, this.pluginDir);
    this.mount(pluginID);
  }

  async uninstall (pluginID) {
    if (pluginID.startsWith('pc-')) {
      throw new Error(`You cannot uninstall an internal plugin. (Tried to uninstall ${pluginID})`);
    }

    await this.unmount(pluginID);
    await rmdirRf(resolve(this.pluginDir, pluginID));
  }

  // Start
  startPlugins () {
    const isOverlay = (/overlay/).test(location.pathname);
    readdirSync(this.pluginDir).sort(this._sortPlugins).forEach(filename => this.mount(filename));
    for (const plugin of [ ...this.plugins.values() ]) {
      if (powercord.settings.get('disabledPlugins', []).includes(plugin.pluginID)) {
        continue;
      }
      if (
        (plugin.manifest.appMode === 'overlay' && isOverlay) ||
        (plugin.manifest.appMode === 'app' && !isOverlay) ||
        plugin.manifest.appMode === 'both'
      ) {
        this.load(plugin.pluginID);
      } else {
        this.plugins.delete(plugin);
      }
    }
  }

  shutdownPlugins () {
    return this._bulkUnload([ ...powercord.pluginManager.plugins.keys() ]);
  }

  _sortPlugins (pluginA, pluginB) {
    const priority = [ 'pc-classNameNormalizer', 'pc-commands', 'pc-settings', 'pc-pluginManager', 'pc-updater' ].reverse();
    const priorityA = priority.indexOf(pluginA);
    const priorityB = priority.indexOf(pluginB);
    return (priorityA === priorityB ? 0 : (priorityA < priorityB ? 1 : -1));
  }

  async _bulkUnload (plugins) {
    const nextPlugins = [];
    for (const plugin of plugins) {
      const deps = this.get(plugin).allDependencies;
      if (deps.filter(dep => this.get(dep) && this.get(dep).ready).length !== 0) {
        nextPlugins.push(plugin);
      } else {
        await this.unmount(plugin);
      }
    }

    if (nextPlugins.length !== 0) {
      await this._bulkUnload(nextPlugins);
    }
  }
};
