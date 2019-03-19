const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { writeFile, mkdir } = require('fs').promises;
const { existsSync } = require('fs');
const { join } = require('path');
const { get, post } = require('powercord/http');
const { WEBSITE } = require('powercord/constants');

const settingsPath = join(__dirname, '..', '..', 'settings');

module.exports = class SettingsManager {
  constructor (category) {
    if (!category) {
      throw new TypeError('Missing settings category name');
    }

    this.category = category;
    this.settingsFile = join(settingsPath, `${this.category}.json`);
    this.config = this._load();

    SettingsManager.instances = [ ...(SettingsManager.instances || []), this ];
  }

  get (nodePath, defaultValue) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.config;

    for (const fragment of nodePaths) {
      currentNode = currentNode[fragment];
    }

    return (currentNode === void 0 || currentNode === null)
      ? defaultValue
      : currentNode;
  }

  set (nodePath, value) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.config;

    for (const fragment of nodePaths) {
      if (nodePaths.indexOf(fragment) === nodePaths.length - 1) {
        currentNode[fragment] = value;
      } else if (!currentNode[fragment]) {
        currentNode[fragment] = {};
      }

      currentNode = currentNode[fragment];
    }

    this._save();
  }

  setConfig (config) {
    this.config = config;
    this._save();
  }

  _load () {
    try {
      return require(this.settingsFile);
    } catch (_) {
      return {};
    }
  }

  async _save () {
    if (!existsSync(settingsPath)) {
      await mkdir(settingsPath);
    }

    await writeFile(this.settingsFile, JSON.stringify(this.config, null, 2));
  }

  // @todo: Discord settings sync
  static async upload () {
    const settings = {};
    SettingsManager.instances.forEach(i => {
      if (Object.keys(i.config).length > 0) {
        settings[i.category] = i.config;
      }
    });

    const passphrase = powercord.settings.get('passphrase', '');
    const token = powercord.settings.get('powercordToken');
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);

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

  static async download () {
    const passphrase = powercord.settings.get('passphrase', '');
    const token = powercord.settings.get('powercordToken');
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);

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
        const instance = SettingsManager.instances.find(i => i.category === category);
        if (instance) {
          instance.setConfig(data[category]);
        }
      });
    } catch (e) {
      return console.error('%c[Powercord:SettingsManager]', 'color: #257dd4', 'Unable to sync settings!', e);
    }
  }
};
