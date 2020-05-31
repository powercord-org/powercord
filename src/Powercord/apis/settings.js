const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { Flux } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { get, put } = require('powercord/http');
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
 * Powercord Settings API
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

  /** @deprecated */
  async upload () {
    if (!powercord.account || !this.store.getSetting('pc-general', 'settingsSync', false)) {
      return;
    }

    const passphrase = store.getSetting('pc-general', 'passphrase', '');
    const token = store.getSetting('pc-general', 'powercordToken');
    const baseUrl = store.getSetting('pc-general', 'backendURL', WEBSITE);

    let isEncrypted = false;
    const payloads = {
      powercord: JSON.stringify(store.getAllSettings()),
      discord: JSON.stringify(this.localStorage.items)
    };

    if (passphrase !== '') {
      for (const payload in payloads) {
        // key + IV
        const iv = randomBytes(16);
        const salt = randomBytes(32);
        const key = scryptSync(passphrase, salt, 32);

        // Encryption
        const cipher = createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(payloads[payload]);
        encrypted = Buffer.concat([ encrypted, cipher.final() ]);

        // tada
        payloads[payload] = `${salt.toString('hex')}::${iv.toString('hex')}::${encrypted.toString('hex')}`;
        isEncrypted = true;
      }
    }

    await put(`${baseUrl}/api/v2/users/@me/settings`)
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send({
        isEncrypted,
        ...payloads
      });
  }

  /** @deprecated */
  async download () {
    if (!powercord.account || !store.getSetting('pc-general', 'settingsSync', false)) {
      return;
    }

    const passphrase = store.getSetting('pc-general', 'passphrase', '');
    const token = store.getSetting('pc-general', 'powercordToken');
    const baseUrl = store.getSetting('pc-general', 'backendURL', WEBSITE);
    const response = (await get(`${baseUrl}/api/v2/users/@me/settings`)
      .set('Authorization', token)
      .then(r => r.body));

    const settings = {
      powercord: response.powercord,
      discord: response.discord
    };

    if (response.isEncrypted && passphrase !== '') {
      try {
        for (const origin in settings) {
          const [ salt, iv, encrypted ] = settings[origin].split('::');
          const key = scryptSync(passphrase, Buffer.from(salt, 'hex'), 32);
          const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
          let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
          decrypted = Buffer.concat([ decrypted, decipher.final() ]);

          settings[origin] = decrypted.toString();
        }
      } catch (e) {
        return; // Probably bad passphrase
      }
    }

    const data = JSON.parse(settings.discord);
    Object.keys(data).forEach(item => window.localStorage.setItem(item, JSON.stringify(data[item])));

    try {
      const data = JSON.parse(settings.powercord);
      Object.keys(data).forEach(category => actions.updateSettings(category, data[category]));
    } catch (e) {
      return console.error('%c[Powercord:SettingsManager]', 'color: #7289da', 'Unable to sync settings!', e);
    }
  }

  /** @deprecated */
  get localStorage () {
    const { localStorage } = window;
    const blacklist = [
      'APPLICATION_RPC_RESPONSE', 'deviceProperties', 'email_cache',
      'gatewayURL', 'referralProperties', 'token', 'user_id_cache'
    ];

    const items = {};

    for (const item in localStorage) {
      if (localStorage.hasOwnProperty(item) && !blacklist.includes(item)) {
        items[item] = JSON.parse(localStorage[item]);
      }
    }

    return { items };
  }
}

module.exports = SettingsAPI;
