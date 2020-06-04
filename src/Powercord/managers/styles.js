const { join } = require('path');
const { readdirSync, existsSync } = require('fs');
const { readFile, lstat } = require('fs').promises;

const { Theme } = require('powercord/entities');
const { SETTINGS_FOLDER } = require('powercord/constants');

const fileRegex = /\.((s?c|le)ss|styl)$/;

const ErrorTypes = Object.freeze({
  NOT_A_DIRECTORY: 'NOT_A_DIRECTORY',
  MANIFEST_LOAD_FAILED: 'MANIFEST_LOAD_FAILED',
  INVALID_MANIFEST: 'INVALID_MANIFEST'
});

module.exports = class StyleManager {
  constructor () {
    this.themesDir = join(__dirname, '../themes');
    this.themes = new Map();

    if (!window.__SPLASH__) {
      readFile(join(__dirname, 'style.css'), 'utf8').then(css => {
        const appendStyle = () => {
          const style = document.createElement('style');
          style.id = 'powercord-main-css';
          style.dataset.powercord = true;
          style.innerHTML = css;
          document.head.appendChild(style);
        };
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', appendStyle);
        } else {
          appendStyle();
        }
      });
    }
  }

  get disabledThemes () {
    if (window.__SPLASH__) {
      if (!this.__settings) {
        this.__settings = {};
        try {
          this.__settings = require(join(SETTINGS_FOLDER, 'pc-general.json'));
        } finally {
          return this.__settings.disabledThemes || [];
        }
      }
    }
    return powercord.settings.get('disabledThemes', []);
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
    return !this.disabledThemes.includes(theme);
  }

  enable (themeID) {
    if (!this.get(themeID)) {
      throw new Error(`Tried to enable a non installed theme (${themeID})`);
    }

    powercord.settings.set('disabledThemes', this.disabledThemes.filter(p => p !== themeID));
    this.themes.get(themeID).apply();
  }

  disable (themeID) {
    const plugin = this.get(themeID);
    if (!plugin) {
      throw new Error(`Tried to disable a non installed theme (${themeID})`);
    }

    powercord.settings.set('disabledThemes', [ ...this.disabledThemes, themeID ]);
    this.themes.get(themeID).remove();
  }

  async mount (themeID, filename) {
    const stat = await lstat(join(this.themesDir, filename));
    if (stat.isFile()) {
      this._logError(ErrorTypes.NOT_A_DIRECTORY, [ themeID ]);
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
      this._logError(ErrorTypes.MANIFEST_LOAD_FAILED, [ themeID ]);
      console.error('%c[Powercord:StyleManager]', 'color: #7289da', 'Failed to load manifest', e);
      return;
    }

    const errors = this._validateManifest(manifest);
    if (errors.length > 0) {
      this._logError(ErrorTypes.INVALID_MANIFEST, [ themeID ]);
      console.error('%c[Powercord:StyleManager]', 'color: #7289da', `Invalid manifest; Detected the following errors:\n\t${errors.join('\n\t')}`);
      return;
    }

    if (window.__SPLASH__ && manifest.splashTheme) {
      manifest.effectiveTheme = manifest.splashTheme;
    } else if (window.__OVERLAY__ && manifest.overlayTheme) {
      manifest.effectiveTheme = manifest.overlayTheme;
    } else if (!window.__OVERLAY__ && !window.__SPLASH__ && manifest.theme) {
      manifest.effectiveTheme = manifest.theme;
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

  // Start/Stop
  async loadThemes (sync = false) {
    const missingThemes = [];
    const files = readdirSync(this.themesDir);
    for (const filename of files) {
      if (filename.startsWith('.')) {
        console.debug('%c[Powercord:StyleManager]', 'color: #7289da', 'Ignoring dotfile', filename);
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

      if (!this.disabledThemes.includes(themeID)) {
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

  _logError (errorType, args) {
    if (window.__SPLASH__ || window.__OVERLAY__) {
      return; // Consider an alternative logging method?
    }

    switch (errorType) {
      case ErrorTypes.NOT_A_DIRECTORY:
        powercord.api.notices.sendToast('sm-invalid-theme', {
          header: `Invalid theme: "${args[0]}" is a file`,
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
        break;
      case ErrorTypes.MANIFEST_LOAD_FAILED:
        powercord.api.notices.sendToast('sm-invalid-theme', {
          header: `Failed to load manifest for "${args[0]}"`,
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
        break;
      case ErrorTypes.INVALID_MANIFEST:
        powercord.api.notices.sendToast('sm-invalid-theme', {
          header: `Invalid manifest for "${args[0]}"`,
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
        break;
    }
  }

  /*
   * --------------
   * VALIDATOR HELL
   * --------------
   */

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
    } else if (![ 'string', 'select', 'number', 'color', 'color_alpha', 'url', 'background', 'font' ].includes(option.type)) {
      errors.push(`Invalid option type: "${option.type}" is not a valid option type. Please refer to the documentation.`);
    }
    if (option.type === 'string' && typeof option.limit !== 'undefined') {
      errors.push(...this._validateLimits(option.limit));
    }
    if (option.type === 'select') {
      errors.push(...this._validateSettingsSelect(option));
    }
    if (option.type === 'number') {
      errors.push(...this._validateSettingsNumber(option));
    }
    return errors;
  }

  _validateSettingsSelect (option) {
    const errors = [];
    if (!Array.isArray(option.options)) {
      errors.push(`Invalid select options: expected an array got ${typeof option.options}`);
    } else {
      option.options.forEach(opt => {
        if (typeof opt !== 'object') {
          errors.push(`Invalid select option: expected an object got ${typeof option.name}`);
        } else {
          if (typeof opt.name !== 'string') {
            errors.push(`Invalid select option name: expected a string got ${typeof option.name}`);
          }
          if (typeof opt.value !== 'string') {
            errors.push(`Invalid select option value: expected a string got ${typeof option.name}`);
          }
        }
      });
    }
    return errors;
  }

  _validateSettingsNumber (option) {
    const errors = [];
    if (typeof option.limit !== 'undefined') {
      errors.push(...this._validateLimits(option.limit));
    }
    if (typeof option.markers !== 'undefined') {
      if (!Array.isArray(option.markers)) {
        errors.push(`Invalid option markers: expected an array got ${typeof option.markers}`);
      } else if (option.markers.some(m => typeof m !== 'number')) {
        errors.push('Invalid option markers: some entries aren\'t numbers!');
      }
    }
    if (![ 'undefined', 'boolean' ].includes(typeof option.sticky)) {
      errors.push(`Invalid option stickyness: expected a boolean got ${typeof option.sticky}`);
    }
    return errors;
  }

  _validateLimits (limits) {
    const errors = [];
    if (!Array.isArray(limits)) {
      errors.push(`Invalid limit value: expected an array got ${typeof limits}`);
    } else if (limits.length !== 2) {
      errors.push(`Invalid limit value: expected two values, got ${limits.length}`);
    } else if (typeof limits[0] !== 'number' || typeof limits[1] !== 'number') {
      errors.push(`Invalid limit value: expected the values to be numbers, got [${typeof limits[0]}, ${typeof limits[1]}]`);
    } else if (limits[0] > limits[1]) {
      errors.push('Invalid limit value: minimum is greater than maximum');
    }
    return errors;
  }
};
