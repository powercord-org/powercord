
const { remote: { app, getCurrentWebContents } } = require('electron');
const { join } = require('path');
const { readdirSync, readFileSync } = require('fs');
const buble = require('buble');

module.exports = class Aethcord {
  constructor () {
    this.preload();
    this.StateWatcher = null;
    this.CSSStore = null;
    this.PluginStore = null;
    this.React = null;
    this.ReactDOM = null;

    getCurrentWebContents().on('dom-ready', this.init.bind(this));
  }

  async init () {
    await this.hookReact();

    const StateWatcher = require('aethcord/Modules/StateWatcher');
    const CSSStore = require('aethcord/Modules/CSSStore');
    const PluginStore = require('aethcord/Modules/PluginStore');

    this.StateWatcher = new StateWatcher();
    this.CSSStore = new CSSStore();
    this.PluginStore = new PluginStore(this);
    this.PluginStore.init();
  }

  async hookReact () {
    const findModule = require('aethcord/Modules/findModule.js');

    this.React = findModule(['createElement', 'Component']);
    this.ReactDOM = findModule(['render', 'createPortal']);

    require.extensions['.jsx'] = (mdl, path) => {
      const { code } = buble.transform(readFileSync(path).toString(), {
        jsx: 'Aethcord.React.createElement'
      });
      return mdl._compile(code, path);
    };
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
