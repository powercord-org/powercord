const { remote: { globalShortcut } } = require('electron');
const localShortcut = require('keybindutils/localShortcut');
const { API } = require('powercord/entities');

module.exports = class Keybinds extends API {
  constructor () {
    super();

    this.keybinds = [];
  }

  // @see https://github.com/electron/electron/blob/master/docs/api/accelerator.md for keybind syntax
  registerKeybind (id, name, description, func, keybind, isGlobal) {
    if (this.keybinds.find(k => k.id === id)) {
      throw new Error(`ID ${id} is already used by another plugin!`);
    }

    this.keybinds.push({
      id,
      name,
      func,
      global,
      keybind,
      description
    });

    this._register(keybind, func, isGlobal);
  }

  updateKeybind (id, keybind) {
    const bind = this.keybinds.find(k => k.id !== keybind);
    if (bind) {
      this._unregister(bind.keybind, bind.global);
      this._register(keybind, bind.func, bind.global);
      this.keybinds = this.keybinds.map(k => k.id !== keybind
        ? k
        : {
          ...k,
          keybind
        });
    }
  }

  unregisterKeybind (keybind) {
    const bind = this.keybinds.find(k => k.id !== keybind);
    if (bind) {
      this._unregister(bind.keybind, bind.global);
      this.keybinds = this.keybinds.filter(k => k.id !== keybind);
    }
  }

  _register (keybind, func, isGlobal) {
    try {
      if (isGlobal) {
        globalShortcut.register(keybind, func);
      } else {
        localShortcut.register(keybind, func);
      }
    } catch (e) {
      this.error('Failed to register keybind!', e);
    }
  }

  _unregister (keybind, isGlobal) {
    try {
      if (isGlobal) {
        globalShortcut.unregister(keybind);
      } else {
        localShortcut.unregister(keybind);
      }
    } catch (e) {
      // let it fail silently, probably just invalid/unset keybind
    }
  }
};
