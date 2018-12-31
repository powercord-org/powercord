const { remote: { globalShortcut } } = require('electron');
const Plugin = require('powercord/Plugin');
const { React } = require('powercord/webpack');

const Settings = require('./Settings.jsx');

module.exports = class KeybindManager extends Plugin {
  constructor () {
    super({
      dependencies: [ 'pc-settings' ]
    });

    this.registered = false;
    this.keybinds = [];
  }

  // @see https://github.com/electron/electron/blob/master/docs/api/accelerator.md for keybind syntax
  register (id, name, description, func, defaultKeybind) {
    if (this.keybinds.find(k => k.id === id)) {
      throw new Error(`ID ${id} is already used by another plugin!`);
    }

    // We only register settings panel here, because if there is no keybind to configure just don't show the settings tab
    this._registerSettingsTab();

    this.keybinds.push({
      id,
      name,
      func,
      description,
      defaultKeybind,
      keybind: this.settings.get(id, defaultKeybind)
    });

    this._safeRegister(this.settings.get(id, defaultKeybind), func);
  }

  _registerSettingsTab () {
    if (!this.registered) {
      this.registered = true;
      powercord
        .pluginManager
        .get('pc-settings')
        .register('pc-keybinds', 'Keybinds', () =>
          React.createElement(Settings, {
            onChange: this._handleChange.bind(this),
            onRecord: this._handleRecord.bind(this),
            keybinds: this.keybinds
          })
        );
    }
  }

  _handleRecord (keybindId) {
    const keybind = this.keybinds.find(k => k.id === keybindId);

    try {
      globalShortcut.unregister(keybind.keybind);
    } catch (e) {
      // let it fail silently, probably just invalid keybind
    }
  }

  _handleChange (keybindId, key) {
    const keybind = this.keybinds.find(k => k.id === keybindId);

    this._safeRegister(key || keybind.defaultKeybind, keybind.func);
    this.keybinds = this.keybinds.map(k => k.id === keybindId ? Object.assign(k, { keybind: key }) : k);
    this.settings.set(keybindId, key);
  }

  _safeRegister (keybind, func) {
    try {
      globalShortcut.register(keybind, func);
    } catch (e) {
      this.error('Failed to register keybind!', e);
    }
  }
};
