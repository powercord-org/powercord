const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { get, post } = require('powercord/http');
const { API } = require('powercord/entities');

const Category = require('./category');

module.exports = class Settings extends API {
  constructor () {
    super();

    this.settings = {};
  }

  // Classic stuff
  async apiDidLoad () {
    await Settings.download();
    this._interval = setInterval(Settings.upload, 5 * 60 * 1000);
  }

  async apiWillUnload () {
    await Settings.upload();
  }

  // Manage settings
  get (category, setting, defaultValue) {
    this._ensureCategory(category);
    this.settings[category].get(setting, defaultValue);
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

    const passphrase = powercord.settings.get('passphrase', '');
    const token = powercord.settings.get('powercordToken');
    const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');

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
    const passphrase = powercord.settings.get('passphrase', '');
    const token = powercord.settings.get('powercordToken');
    const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');

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
