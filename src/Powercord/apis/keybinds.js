const { remote: { globalShortcut } } = require('electron');
const localShortcut = require('keybindutils/localShortcut');
const { API } = require('powercord/entities');

/**
 * @typedef PowercordKeybind
 * @property {String} keybind Keybind accelerator
 * @property {Function} executor Executor
 * @property {Boolean} isGlobal Whether the keybind should be usable when Discord is not focused or not
 * @see https://github.com/electron/electron/blob/master/docs/api/accelerator.md
 */

/**
 * Powercord Keybinds API
 * @property {Object.<String, PowercordKeybind>} keybinds Keybinds
 */
class KeybindsAPI extends API {
  constructor () {
    super();

    this.keybinds = {};
  }

  /**
   * Registers a keybind
   * @param {String} id Keybind ID
   * @param {PowercordKeybind} keybind Keybind
   */
  registerKeybind (id, keybind) {
    if (this.keybinds[id]) {
      throw new Error(`Keybind ${id} is already registered!`);
    }
    this.keybinds[id] = keybind;
    this._register(keybind);
  }

  /**
   * Changes a keybind
   * @param {String} id Keybind ID to update
   * @param {String} newBind New keybind to bind
   */
  changeBind (id, newBind) {
    if (!this.keybinds[id]) {
      throw new Error(`Keybind ${id} is not registered!`);
    }

    this._unregister(this.keybinds[id]);
    this.keybinds[id].keybind = newBind;
    this._register(this.keybinds[id]);
  }

  /**
   * Unregisters a keybind
   * @param {String} id Keybind to unregister
   */
  unregisterKeybind (id) {
    if (this.keybinds[id]) {
      this._unregister(this.keybinds[id]);
      delete this.keybinds[id];
    }
  }

  /** @private */
  _register (keybind) {
    try {
      if (keybind.isGlobal) {
        globalShortcut.register(keybind.keybind, keybind.executor);
      } else {
        localShortcut.register(keybind.keybind, keybind.executor);
      }
    } catch (e) {
      this.error('Failed to register keybind!', e);
    }
  }

  /** @private */
  _unregister (keybind) {
    try {
      if (keybind.isGlobal) {
        globalShortcut.unregister(keybind.keybind);
      } else {
        localShortcut.unregister(keybind.keybind);
      }
    } catch (e) {
      // let it fail silently, probably just invalid/unset keybind
    }
  }
}

module.exports = KeybindsAPI;
