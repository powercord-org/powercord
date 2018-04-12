
const { remote: { app, getCurrentWebContents } } = require('electron');
const { join } = require('path');
const { readdirSync } = require('fs');
const CSSManager = require(join(__dirname, 'CSSManager'));
const StateWatcher = require(join(__dirname, 'StateWatcher.js'));

module.exports = class Aethcord {
  constructor () {
    this.preload();
    this.CSSManager = null;
    this.StateWatcher = null;

    this.init();
  }

  async init () {
    getCurrentWebContents().on('dom-ready', () => {
      this.CSSManager = new CSSManager();
      this.StateWatcher = new StateWatcher();

      for (const plugin of readdirSync(join(__dirname, 'plugins'))) {
        require(join(__dirname, 'plugins', plugin)).call(this);
      }
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
