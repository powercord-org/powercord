/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { randomBytes, scryptSync, createCipheriv, createDecipheriv } = require('crypto');
const { React, Flux, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get, post } = require('powercord/http');
const { API } = require('powercord/entities');

const store = require('./store');
const actions = require('./store/actions');

const ErrorBoundary = require('./ErrorBoundary');
const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const FormSection = AsyncComponent.from(getModuleByDisplayName('FormSection'));

module.exports = class Settings extends API {
  constructor () {
    super();

    this.ErrorBoundary = ErrorBoundary;
    this.actions = actions;
    this.store = store;
    this.tabs = [];
  }

  // Classic stuff
  async startAPI () {
    // defer download a bit
    setTimeout(this.download.bind(this), 1500);
    this._interval = setInterval(this.upload.bind(this), 10 * 60 * 1000);
  }

  async apiWillUnload () {
    clearInterval(this._interval);
    await this.upload();
  }

  // Categories
  registerTab (pluginID, section, displayName, render, connectStore = true) {
    if (!section.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a settings panel with an invalid ID! You can only use letters, numbers, dashes and underscores. (ID: ${section})`);
    }

    if (this.tabs.find(s => s.section === section)) {
      return this.error(`Key ${section} is already used by another plugin!`);
    }

    this.tabs.push({
      section,
      label: displayName,
      element: this._renderSettingsPanel.bind(this, displayName, connectStore ? this._connectStores(pluginID)(render) : render)
    });
  }

  unregisterTab (section) {
    this.tabs = this.tabs.filter(s => s.section !== section);
  }

  buildCategoryObject (category) {
    return {
      connectStore: (component) => this._connectStores(category)(component),
      get: (setting, defaultValue) => powercord.api.settings.store.getSetting(category, setting, defaultValue),
      getKeys: () => powercord.api.settings.store.getSettingsKeys(category),
      delete: (setting) => powercord.api.settings.actions.deleteSetting(category, setting),
      set: (setting, newValue) => {
        if (newValue === void 0) {
          return powercord.api.settings.actions.toggleSetting(category, setting);
        }
        powercord.api.settings.actions.updateSetting(category, setting, newValue);
      }
    };
  }

  // React + Flux
  _connectStores (category) {
    return Flux.connectStores([ this.store ], () => ({
      settings: this.store.getSettings(category),
      getSetting: (setting, defaultValue) => this.store.getSetting(category, setting, defaultValue),
      updateSetting: (setting, value) => this.actions.updateSetting(category, setting, value),
      toggleSetting: (setting, defaultValue) => this.actions.toggleSetting(category, setting, defaultValue)
    }));
  }

  _renderSettingsPanel (title, contents) {
    let panelContents;
    try {
      panelContents = React.createElement(contents);
    } catch (e) {
      this.error('Failed to render settings panel, check if your function returns a valid React component!');
      panelContents = null;
    }

    const h2 = React.createElement(FormTitle, { tag: 'h2' }, title);
    return React.createElement(ErrorBoundary, null, React.createElement(FormSection, {}, h2, panelContents));
  }

  // @todo: Discord settings sync
  async upload () {
    if (!powercord.account || !this.store.getSetting('pc-general', 'settingsSync', false)) {
      return;
    }

    const passphrase = this.store.getSetting('pc-general', 'passphrase', '');
    const token = this.store.getSetting('pc-general', 'powercordToken');
    const baseUrl = this.store.getSetting('pc-general', 'backendURL', WEBSITE);

    let isEncrypted = false;
    let payload = JSON.stringify(this.store.settings);

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
        powercord: payload
      });
  }

  async download () {
    if (!powercord.account || !this.store.getSetting('pc-general', 'settingsSync', false)) {
      return;
    }

    const passphrase = this.store.getSetting('pc-general', 'passphrase', '');
    const token = this.store.getSetting('pc-general', 'powercordToken');
    const baseUrl = this.store.getSetting('pc-general', 'backendURL', WEBSITE);

    let { isEncrypted, powercord: settings } = (await get(`${baseUrl}/api/users/@me/settings`)
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
      Object.keys(data).forEach(category => actions.updateSettings(category, data[category]));
    } catch (e) {
      return console.error('%c[Powercord:SettingsManager]', 'color: #7289da', 'Unable to sync settings!', e);
    }
  }
};
