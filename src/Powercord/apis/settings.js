const { Flux } = require('powercord/webpack');
const { API } = require('powercord/entities');

const store = require('./settingsStore/store');
const actions = require('./settingsStore/actions');

/**
 * @typedef SettingsCategory
 * @property {Function} connectStore Connects a component to the settings store
 * @property {Function(String, String): String} get Gets a setting, or fallbacks to default value
 * @property {Function(): String[]} getKeys Get all settings key
 * @property {Function(String): void} delete Deletes a setting
 * @property {Function(String, String): void} set Sets a setting
 */

/**
 * @typedef SettingsTab
 * @property {String} category Settings category. Most of the time, you want this to be the entity ID
 * @property {String|function(): String} label Settings tab label
 * @property {function(): React.ReactNode} render Render method
 * @property {undefined} settings Use it and you'll be fined 69 cookies
 */

/**
 * Replugged Settings API
 * @property {Flux.Store} store Flux store
 * @property {Object.<String, SettingsTab>} tabs Settings tab
 */
class SettingsAPI extends API {
  constructor () {
    super();

    this.store = store;
    this.tabs = {};
  }

  /**
   * Registers a settings tab
   * @param {String} tabId Settings tab ID
   * @param {SettingsTab} props Props of your settings tab
   */
  registerSettings (tabId, props) {
    if (this.tabs[tabId]) {
      throw new Error(`Settings tab ${tabId} is already registered!`);
    }

    this.tabs[tabId] = props;
    this.tabs[tabId].render = this.connectStores(props.category)(props.render);
    Object.freeze(this.tabs[tabId].render.prototype);
    Object.freeze(this.tabs[tabId]);
  }

  /**
   * Unregisters a settings tab
   * @param {String} tabId Settings tab ID to unregister
   */
  unregisterSettings (tabId) {
    if (this.tabs[tabId]) {
      delete this.tabs[tabId];
    }
  }

  /**
   * Builds a settings category that can be used by a plugin
   * @param {String} category Settings category name
   * @returns {SettingsCategory}
   */
  buildCategoryObject (category) {
    return {
      connectStore: (component) => this.connectStores(category)(component),
      getKeys: () => store.getSettingsKeys(category),
      get: (setting, defaultValue) => store.getSetting(category, setting, defaultValue),
      set: (setting, newValue) => {
        if (newValue === void 0) {
          return actions.toggleSetting(category, setting);
        }
        actions.updateSetting(category, setting, newValue);
      },
      delete: (setting) => {
        actions.deleteSetting(category, setting);
      }
    };
  }

  /**
   * Creates a flux decorator for a given settings category
   * @param {String} category Settings category
   * @returns {Function}
   */
  connectStores (category) {
    return Flux.connectStores([ this.store ], () => this._fluxProps(category));
  }

  /** @private */
  _fluxProps (category) {
    return {
      settings: store.getSettings(category),
      getSetting: (setting, defaultValue) => store.getSetting(category, setting, defaultValue),
      updateSetting: (setting, value) => actions.updateSetting(category, setting, value),
      toggleSetting: (setting, defaultValue) => actions.toggleSetting(category, setting, defaultValue)
    };
  }

  // Stuff to rewrite
  async startAPI () {
    // defer download a bit
    setTimeout(this.download.bind(this), 1500);
    this._interval = setInterval(this.upload.bind(this), 10 * 60 * 1000);
  }

  async apiWillUnload () {
    clearInterval(this._interval);
    await this.upload();
  }

  async upload () {
    // https://img.pngio.com/be-right-back-png-group-hd-png-well-be-right-back-png-640_480.png
    return false;
  }

  async download () {
    // https://img.pngio.com/be-right-back-png-group-hd-png-well-be-right-back-png-640_480.png
    return false;
  }
}

/*
 * // key + IV
 * const iv = randomBytes(16);
 * const salt = randomBytes(32);
 * const key = scryptSync(passphrase, salt, 32);
 *
 * // Encryption
 * const cipher = createCipheriv('aes-256-cbc', key, iv);
 * let encrypted = cipher.update(payloads[payload]);
 * encrypted = Buffer.concat([ encrypted, cipher.final() ]);
 *
 *
 * const [ salt, iv, encrypted ] = settings[origin].split('::');
 * const key = scryptSync(passphrase, Buffer.from(salt, 'hex'), 32);
 * const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
 * let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
 * decrypted = Buffer.concat([ decrypted, decipher.final() ]);
 */

module.exports = SettingsAPI;
