const { globalShortcut } = require('electron');
const Plugin = require('powercord/Plugin');
const { React } = require('powercord/webpack');

const Settings = require('./Settings.jsx');

module.exports = class KeybindManager extends Plugin {
  constructor () {
    super({
      dependencies: [ 'pc-settings' ]
    });

    this.keybinds = [];
  }

  start () {
    powercord
      .pluginManager
      .get('pc-settings')
      .register('pc-keybinds', 'Keybinds', () =>
        React.createElement(Settings, {
          onChange: this._handleChange.bind(this),
          keybinds: this.keybinds
        })
      );
  }

  // @see https://github.com/electron/electron/blob/master/docs/api/accelerator.md for keybind syntax
  register (id, name, func, defaultKeybind) {
    if (this.keybinds.filter(k => k.id === id).length !== 0) {
      throw new Error(`ID ${id} is already used by another plugin!`);
    }
    this.keybinds.push({
      id,
      name,
      func,
      keybind: this.settingsManager.get(id, defaultKeybind)
    });

    globalShortcut.register(this.settingsManager.get(id, defaultKeybind), func);
  }

  _handleChange (keybindId, key) {
    const keybind = this.keybinds.find(k => k.id === keybindId);

    globalShortcut.unregister(keybind.keybind);
    globalShortcut.register(key, keybind.func);
    this.keybinds = this.keybinds.map(k => k.id === keybindId
      ? {
        ...k,
        keybind: key
      }
      : k);
    this.settingsManager.set(keybindId, key);
  }
};
