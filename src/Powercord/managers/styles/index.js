const { resolve } = require('path');
const { readdirSync } = require('fs');
const { lstat } = require('fs').promises;

const Theme = require('./theme');

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
        console.warn('%c[Powercord]', 'color: #257dd4', `Theme "${themeID}" loaded in development mode`);
      } else {
        const manifest = require(resolve(this.themesDir, filename, 'powercord_manifest.json'));
        if (!this.manifestKeys.every(key => manifest.hasOwnProperty(key))) {
          return console.error('%c[Powercord]', 'color: #257dd4', `Theme "${themeID}" doesn't have a valid manifest - Skipping`);
        }

        if (!window.__OVERLAY__ && manifest.theme) {
          manifest.effectiveTheme = manifest.theme;
        } else if (window.__OVERLAY__ && manifest.overlayTheme) {
          manifest.effectiveTheme = manifest.overlayTheme;
        } else {
          return console.warn('%c[Powercord]', 'color: #257dd4', `Theme "${themeID}" is not meant to run on that environment - Skipping`);
        }

        theme = new Theme(themeID, {
          ...manifest,
          theme: resolve(resolve(this.themesDir, filename, manifest.effectiveTheme))
        });
      }
    } catch (e) {
      return console.error('%c[Powercord]', 'color: #257dd4', `Theme "${themeID}" doesn't have a valid manifest or is not a valid file - Skipping`);
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
  async loadThemes () {
    this.loadPluginCSS('powercord-core', resolve(__dirname, 'css', 'index.scss'));

    const files = readdirSync(this.themesDir);
    for (const filename of files) {
      if (filename === '.exists' || filename === '.DS_Store') {
        continue;
      }

      const themeID = filename.split('.').shift().toLowerCase();
      await this.mount(themeID, filename);

      // if theme didn't mounted
      if (!this.themes.get(themeID)) {
        continue;
      }

      if (!powercord.settings.get('disabledThemes', []).includes(themeID)) {
        this.themes.get(themeID).apply();
      }
    }
  }

  unloadThemes () {
    [ ...this.themes.values() ].forEach(t => t.remove());
  }
};
