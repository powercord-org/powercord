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

  start () {
    // Clear any previously set keybind
    Object.keys(this.settings.config).forEach(keybind => {
      this._safeUnregister(this.settings.get(keybind));
    });
    this.register('owo', 'uuuuuuuh', 'idk', () => console.log('fucker'), 'Ctrl+M');
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
            onRecord: this._handleRecord.bind(this)
          })
        );
    }
  }

  _handleRecord (keybindId) {
    const keybind = this.keybinds.find(k => k.id === keybindId);
    this._safeUnregister(keybind.keybind);
  }

  _handleChange (keybindId, rawKey) {
    const keybind = this.keybinds.find(k => k.id === keybindId);
    const key = rawKey || keybind.defaultKeybind;

    this._safeUnregister(keybind.keybind); // just in case
    this._safeRegister(key, keybind.func);
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

  _safeUnregister (keybind) {
    try {
      globalShortcut.unregister(keybind);
    } catch (e) {
      // let it fail silently, probably just invalid/unset keybind
    }
  }
};
