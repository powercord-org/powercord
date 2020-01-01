/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
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
const { lstat } = require('fs').promises;

const { Theme } = require('powercord/entities');

module.exports = class StyleManager {
  constructor () {
    this.themesDir = resolve(__dirname, '..', '..', 'themes');
    this.themes = new Map();

    this.manifestKeys = [ 'name', 'version', 'description', 'author', 'license' ];
  }

  // Getters
  get (themeID) {
    return this.themes.get(themeID);
  }

  getThemes () {
    return [ ...this.themes.keys() ];
  }

  isInstalled (theme) {
    return this.themes.has(theme);
  }

  isEnabled (theme) {
    return !powercord.settings.get('disabledThemes', []).includes(theme);
  }

  enable (themeID) {
    if (!this.get(themeID)) {
      throw new Error(`Tried to enable a non installed theme (${themeID})`);
    }

    powercord.settings.set(
      'disabledThemes',
      powercord.settings.get('disabledThemes', []).filter(p => p !== themeID)
    );

    this.themes.get(themeID).apply();
  }

  disable (themeID) {
    const plugin = this.get(themeID);
    if (!plugin) {
      throw new Error(`Tried to disable a non installed theme (${themeID})`);
    }

    powercord.settings.set('disabledThemes', [
      ...powercord.settings.get('disabledThemes', []),
      themeID
    ]);

    this.themes.get(themeID).remove();
  }

  async mount (themeID, filename) {
    const stat = await lstat(resolve(this.themesDir, filename));
    let theme;

    try {
      if (stat.isFile()) {
        theme = Theme.fromFile(themeID, filename);
        console.warn('%c[Powercord]', 'color: #7289da', `Theme "${themeID}" loaded in development mode`);
      } else {
        const manifest = require(resolve(this.themesDir, filename, 'powercord_manifest.json'));
        if (!this.manifestKeys.every(key => manifest.hasOwnProperty(key))) {
          return console.error('%c[Powercord]', 'color: #7289da', `Theme "${themeID}" doesn't have a valid manifest - Skipping`);
        }

        if (!window.__OVERLAY__ && manifest.theme) {
          manifest.effectiveTheme = manifest.theme;
        } else if (window.__OVERLAY__ && manifest.overlayTheme) {
          manifest.effectiveTheme = manifest.overlayTheme;
        } else {
          return console.warn('%c[Powercord]', 'color: #7289da', `Theme "${themeID}" is not meant to run on that environment - Skipping`);
        }

        theme = new Theme(themeID, {
          ...manifest,
          theme: resolve(resolve(this.themesDir, filename, manifest.effectiveTheme))
        }, true);
      }
    } catch (e) {
      return console.error('%c[Powercord]', 'color: #7289da', `Theme "${themeID}" doesn't have a valid manifest or is not a valid file - Skipping`);
    }

    this.themes.set(themeID, theme);
  }

  unmount (themeID) {
    const theme = this.themes.get(themeID);
    if (!theme) {
      throw new Error(`Tried to unmount a non installed theme (${themeID})`);
    }

    theme.remove();
    this.themes.delete(themeID);
  }

  /*
   * @todo
   * async install (pluginID) {
   *   await exec(`git clone https://github.com/powercord-org/${pluginID}`, this.pluginDir);
   *   this.mount(pluginID);
   * }
   *
   * async uninstall (pluginID) {
   *   if (pluginID.startsWith('pc-')) {
   *     throw new Error(`You cannot uninstall an internal plugin. (Tried to uninstall ${pluginID})`);
   *   }
   *
   *   await this.unmount(pluginID);
   *   await rmdirRf(resolve(this.pluginDir, pluginID));
   * }
   */

  // Plugin CSS
  loadPluginCSS (themeID, file) {
    const theme = Theme.fromFile(themeID, file);
    this.themes.set(themeID, theme);
    theme.apply();
  }

  // Start/Stop
  async loadThemes (sync = false) {
    const missingThemes = [];
    this.loadPluginCSS('powercord-core', resolve(__dirname, 'css', 'index.scss'));

    const files = readdirSync(this.themesDir);
    for (const filename of files) {
      if (filename === '.exists' || filename === '.DS_Store') {
        continue;
      }

      const themeID = filename.split('.').shift();
      if (!sync) {
        await this.mount(themeID, filename);

        // if theme didn't mounted
        if (!this.themes.get(themeID)) {
          continue;
        }
      }

      if (!powercord.settings.get('disabledThemes', []).includes(themeID)) {
        if (sync && !this.isInstalled(themeID)) {
          await this.mount(themeID, filename);
          missingThemes.push(themeID);
        }

        this.themes.get(themeID).apply();
      }
    }

    if (sync) {
      return missingThemes;
    }
  }

  unloadThemes () {
    [ ...this.themes.values() ].forEach(t => t.remove());
  }
};
