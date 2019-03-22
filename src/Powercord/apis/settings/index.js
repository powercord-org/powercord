const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { get, post } = require('powercord/http');
const { API } = require('powercord/entities');

const Category = require('./category');

module.exports = class Settings extends API {
  constructor () {
    super();

    this.settings = {};
    this.tabs = {};
  }

  // Classic stuff
  async apiDidLoad () {
    await this.download();
    this._interval = setInterval(Settings.upload, 5 * 60 * 1000);
  }

  async apiWillUnload () {
    clearInterval(this._interval);
    await this.upload();
  }

  // Categories
  registerTab (key, displayName, render) {
    if (!key.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a settings panel with an invalid ID! You can only use letters, numbers, dashes and underscores. (ID: ${key})`);
    }

    if (this.tabs.find(s => s.key === key)) {
      return this.error(`Key ${key} is already used by another plugin!`);
    }

    this.tabs.push({
      key,
      label: displayName,
      element: this._renderSettingsPanel.bind(this, displayName, render)
    });
  }

  // Manage settings
  getCategory (category) {
    this._ensureCategory(category);
    return this.settings[category];
  }

  get (category, setting, defaultValue) {
    this._ensureCategory(category);
    return this.settings[category].get(setting, defaultValue);
  }

  set (category, setting, value) {
    this._ensureCategory(category);
    this.settings[category].set(setting, value);
  }

  _ensureCategory (category) {
    if (!this.settings[category]) {
      this.settings[category] = new Category(category);
    }
  }

  // @todo: Discord settings sync
  async upload () {
    const settings = {};
    Object.keys(this.settings).forEach(category => {
      settings[category] = this.settings[settings].config;
    });

    const passphrase = this.get('pc-general', 'passphrase', '');
    const token = this.get('pc-general', 'powercordToken');
    const baseUrl = this.get('pc-general', 'backendURL', 'https://powercord.xyz');

    let isEncrypted = false;
    let payload = JSON.stringify(settings);

    if (passphrase !== '') {
      // key + IV
      const iv = randomBytes(16);
      const salt = randomBytes(32);
      const key = scryptSync(passphrase, salt, 32);

      // Encryption
      const cipher = createCipheriv('aes-256-cbc', key, iv);
      let encrypted = cipher.update(payload);
      encrypted = Buffer.concat([ encrypted, cipher.final() ]);

      // tada
      payload = `${salt.toString('hex')}::${iv.toString('hex')}::${encrypted.toString('hex')}`;
      isEncrypted = true;
    }

    await post(`${baseUrl}/api/users/@me/settings`)
      .set('Authorization', token)
      .set('Content-Type', 'application/json')
      .send({
        isEncrypted,
        payload
      });
  }

  async download () {
    const passphrase = this.get('pc-general', 'passphrase', '');
    const token = this.get('pc-general', 'powercordToken');
    const baseUrl = this.get('pc-general', 'backendURL', 'https://powercord.xyz');

    let { isEncrypted, payload: settings } = (await get(`${baseUrl}/api/users/@me/settings`)
      .set('Authorization', token)
      .then(r => r.body));

    if (isEncrypted && passphrase !== '') {
      try {
        const [ salt, iv, encrypted ] = settings.split('::');
        const key = scryptSync(passphrase, Buffer.from(salt, 'hex'), 32);
        const decipher = createDecipheriv('aes-256-cbc', key, Buffer.from(iv, 'hex'));
        let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
        decrypted = Buffer.concat([ decrypted, decipher.final() ]);

        settings = decrypted.toString();
      } catch (e) {
        return; // Probably bad passphrase
      }
    }

    try {
      const data = JSON.parse(settings);
      Object.keys(data).forEach(category => {
        this._ensureCategory(category);
        this.settings[category]._setConfig(data[category]);
      });
    } catch (e) {
      return console.error('%c[Powercord:SettingsManager]', 'color: #257dd4', 'Unable to sync settings!', e);
    }
  }
};
