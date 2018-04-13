
const { remote: { app, getCurrentWebContents } } = require('electron');
const { join } = require('path');
const { readdirSync } = require('fs');

module.exports = class Aethcord {
  constructor () {
    this.preload();
    this.StateWatcher = null;
    this.CSSStore = null;
    this.PluginStore = null;

    this.init();
  }

  async init () {
    getCurrentWebContents().on('dom-ready', () => {
      const StateWatcher = require(join(__dirname, 'StateWatcher.js'));
      const CSSStore = require(join(__dirname, 'CSSStore'));
      const PluginStore = require(join(__dirname, 'PluginStore'));

      this.StateWatcher = new StateWatcher(this);
      this.CSSStore = new CSSStore(this);
      this.PluginStore = new PluginStore(this);
    });
  }

  preload () {
    const appData = app.getPath('appData');
    const dist = Object.keys(process.versions)
      .find(k => k.includes('iscord'))
      .toLowerCase();
    const version = readdirSync(join(appData, dist)).find(d => d.match(/.\d+/));
    require(join(
      appData,
      dist,
      version,
      'modules',
      'discord_desktop_core',
      'core.asar',
      'app',
      'mainScreenPreload.js'
    ));
  }
};
