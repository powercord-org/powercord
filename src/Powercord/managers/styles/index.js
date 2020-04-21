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

const { resolve, join } = require('path');
const { readdirSync, existsSync } = require('fs');
const { lstat } = require('fs').promises;

const { Theme } = require('powercord/entities');

const fileRegex = /\.((s?c|le)ss|styl)$/;

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
    if (stat.isFile()) {
      powercord.api.notices.sendToast('sm-invalid-theme', {
        header: `Invalid theme: "${themeID}" is a file`,
        content: 'This is most likely a mistake. Make sure all your theme files are in a subfolder.',
        type: 'danger',
        buttons: [
          /*
           * {
           *   text: 'Documentation',
           *   color: 'green',
           *   look: 'ghost',
           *   onClick: () => console.log('yes')
           * },
           */
          {
            text: 'Got it',
            look: 'ghost'
          }
        ]
      });
      return;
    }

    const manifestFile = join(this.themesDir, filename, 'powercord_manifest.json');
    if (!existsSync(manifestFile)) {
      // Should we warn here?
      return;
    }

    let manifest;
    try {
      manifest = require(manifestFile);
    } catch (e) {
      powercord.api.notices.sendToast('sm-invalid-theme', {
        header: `Failed to load manifest for "${themeID}"`,
        content: 'This is probably due to a syntax error in the file. Check console for more details.',
        type: 'danger',
        buttons: [
          {
            text: 'Open DevTools',
            color: 'green',
            look: 'ghost',
            onClick: () => require('electron').remote.BrowserWindow.getFocusedWindow().openDevTools()
          },
          {
            text: 'Got it',
            look: 'ghost'
          }
        ]
      });
      console.error('%c[Powercord:StyleManager]', 'color: #7289da', 'Failed to load manifest', e);
      return;
    }

    const errors = this._validateManifest(manifest);
    if (errors.length > 0) {
      powercord.api.notices.sendToast('sm-invalid-theme', {
        header: `Invalid manifest for "${themeID}"`,
        content: 'Check the console for more details.',
        type: 'danger',
        buttons: [
          {
            text: 'Open DevTools',
            color: 'green',
            look: 'ghost',
            onClick: () => require('electron').remote.BrowserWindow.getFocusedWindow().openDevTools()
          },
          {
            text: 'Got it',
            look: 'ghost'
          }
        ]
      });
      console.error('%c[Powercord:StyleManager]', 'color: #7289da', `Invalid manifest; Detected the following errors:\n\t${errors.join('\n\t')}`);
      return;
    }

    if (!window.__OVERLAY__ && manifest.theme) {
      manifest.effectiveTheme = manifest.theme;
    } else if (window.__OVERLAY__ && manifest.overlayTheme) {
      manifest.effectiveTheme = manifest.overlayTheme;
    } else {
      return console.warn('%c[Powercord:StyleManager]', 'color: #7289da', `Theme "${themeID}" is not meant to run on that environment - Skipping`);
    }

    manifest.effectiveTheme = join(this.themesDir, filename, manifest.effectiveTheme);
    this.themes.set(themeID, new Theme(themeID, manifest));
  }

  unmount (themeID) {
    const theme = this.themes.get(themeID);
    if (!theme) {
      throw new Error(`Tried to unmount a non installed theme (${themeID})`);
    }

    theme.remove();
    this.themes.delete(themeID);
  }

  // Plugin CSS
  loadPluginCSS (themeID, file) {
    const theme = Theme.fromFile(themeID, file);
    this.themes.set(themeID, theme);
    return theme.apply();
  }

  // Start/Stop
  async loadThemes (sync = false) {
    const missingThemes = [];
    this.loadPluginCSS('powercord-core', resolve(__dirname, 'css', 'index.scss'));

    const files = readdirSync(this.themesDir);
    for (const filename of files) {
      if (filename.startsWith('.')) {
        console.debug('[Powercord:StyleManager] Ignoring dotfile', filename);
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

  _validateManifest (manifest) {
    const errors = [];
    if (typeof manifest.name !== 'string') {
      errors.push(`Invalid name: expected a string got ${typeof manifest.name}`);
    }
    if (typeof manifest.description !== 'string') {
      errors.push(`Invalid description: expected a string got ${typeof manifest.description}`);
    }
    if (typeof manifest.version !== 'string') {
      errors.push(`Invalid version: expected a string got ${typeof manifest.version}`);
    }
    if (typeof manifest.author !== 'string') {
      errors.push(`Invalid author: expected a string got ${typeof manifest.author}`);
    }
    if (typeof manifest.license !== 'string') {
      errors.push(`Invalid license: expected a string got ${typeof manifest.license}`);
    }
    if (typeof manifest.theme !== 'string') {
      errors.push(`Invalid theme: expected a string got ${typeof manifest.theme}`);
    } else if (!fileRegex.test(manifest.theme)) {
      errors.push('Invalid theme: unsupported file extension');
    }
    if (manifest.overlayTheme) {
      if (typeof manifest.overlayTheme !== 'string') {
        errors.push(`Invalid theme: expected a string got ${typeof manifest.overlayTheme}`);
      } else if (!fileRegex.test(manifest.overlayTheme)) {
        errors.push('Invalid theme: unsupported file extension');
      }
    }
    if (![ 'undefined', 'string' ].includes(typeof manifest.discord)) {
      errors.push(`Invalid discord code: expected a string got ${typeof manifest.discord}`);
    }
    if (manifest.plugins !== void 0) {
      if (!Array.isArray(manifest.plugins)) {
        errors.push(`Invalid plugins: expected an array got ${typeof manifest.plugins}`);
      } else {
        manifest.plugins.forEach(p => errors.push(...this._validatePlugin(p)));
      }
    }
    if (manifest.settings !== void 0) {
      errors.push(...this._validateSettings(manifest.settings));
    }
    return errors;
  }

  _validatePlugin (plugin) {
    const errors = [];
    if (typeof plugin !== 'object') {
      errors.push(`Invalid plugin: expected an object got ${typeof plugin}`);
      return errors;
    }
    if (Array.isArray(plugin)) {
      errors.push('Invalid plugin: expected an object got an array');
      return errors;
    }
    if (typeof plugin.name !== 'string') {
      errors.push(`Invalid plugin name: expected a string got ${typeof plugin.name}`);
    }
    if (typeof plugin.description !== 'string') {
      errors.push(`Invalid plugin description: expected a string got ${typeof plugin.description}`);
    }
    if (![ 'undefined', 'string' ].includes(typeof plugin.author)) {
      errors.push(`Invalid plugin author: expected a string got ${typeof plugin.author}`);
    }
    if (![ 'undefined', 'string' ].includes(typeof plugin.license)) {
      errors.push(`Invalid plugin license: expected a string got ${typeof plugin.license}`);
    }
    if (typeof plugin.file !== 'string') {
      errors.push(`Invalid plugin file: expected a string got ${typeof plugin.file}`);
    } else if (!fileRegex.test(plugin.file)) {
      errors.push('Invalid plugin file: unsupported file extension');
    }
    if (plugin.settings !== void 0) {
      errors.push(...this._validateSettings(plugin.settings));
    }
    return errors;
  }

  _validateSettings (settings) {
    const errors = [];
    if (typeof settings !== 'object') {
      errors.push(`Invalid settings: expected an object got ${typeof settings}`);
      return errors;
    }
    if (Array.isArray(settings)) {
      errors.push('Invalid settings: expected an object got an array');
      return errors;
    }
    if (typeof settings.format !== 'string') {
      errors.push(`Invalid settings format: expected a string got ${typeof settings.format}`);
    } else if (![ 'css', 'scss' ].includes(settings.format)) {
      errors.push(`Invalid settings format: "${settings.format}" is not a valid format. Please refer to the documentation.`);
    }
    if (!Array.isArray(settings.options)) {
      errors.push(`Invalid options: expected an array got ${typeof settings.options}`);
    } else {
      settings.options.forEach(o => errors.push(...this._validateOption(o)));
    }
    return errors;
  }

  _validateOption (option) {
    const errors = [];
    if (typeof option !== 'object') {
      errors.push(`Invalid option: expected an object got ${option}`);
      return errors;
    }
    if (Array.isArray(option)) {
      errors.push('Invalid option: expected an object got an array');
      return errors;
    }
    if (typeof option.name !== 'string') {
      errors.push(`Invalid option name: expected a string got ${typeof option.name}`);
    }
    if (typeof option.variable !== 'string') {
      errors.push(`Invalid option variable: expected a string got ${typeof option.name}`);
    }
    if (option.variable.length === '') {
      errors.push('Invalid option variable: got an empty string');
    }
    if (![ 'undefined', 'string' ].includes(typeof option.description)) {
      errors.push(`Invalid option description: expected a string got ${typeof option.description}`);
    }
    if (typeof option.type !== 'string') {
      errors.push(`Invalid option type: expected a string got ${typeof option.type}`);
    } else if (![ 'string', 'number', 'color', 'color_alpha', 'url' ].includes(option.type)) {
      errors.push(`Invalid option type: "${option.type}" is not a valid option type. Please refer to the documentation.`);
    }
    return errors;
  }
};
