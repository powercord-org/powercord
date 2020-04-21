/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
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

const { getModule, i18n } = require('powercord/webpack');
const { API } = require('powercord/entities');
const strings = require('../../../i18n');
const overrides = require('../../../i18n/overrides');

module.exports = class I18nAPI extends API {
  constructor () {
    super();
    this.messages = {};
    this.locale = null;
    this.loadAllStrings(strings);
    this.loadAllStrings(overrides);
  }

  startAPI () {
    this._startAPI();
  }

  async _startAPI () {
    const module = await getModule([ 'locale', 'theme' ]);
    this.locale = module.locale;
    module.addChangeListener(() => {
      if (module.locale !== this.locale) {
        this.locale = module.locale;
        i18n.loadPromise.then(() => this.addPowercordStrings());
      }
    });
    this.addPowercordStrings();
  }

  addPowercordStrings () {
    Object.assign(i18n._proxyContext.messages, this.messages[this.locale]);
    Object.assign(i18n._proxyContext.defaultMessages, this.messages['en-US']);
    delete i18n._proxyContext.messages.SELF_XSS_HEADER;
    delete i18n._proxyContext.defaultMessages.SELF_XSS_HEADER;
  }

  loadAllStrings (strings) {
    Object.keys(strings).forEach(locale => this.loadStrings(locale, strings[locale]));
  }

  loadStrings (locale, strings) {
    if (!this.messages[locale]) {
      this.messages[locale] = strings;
    } else {
      this.messages[locale] = {
        ...this.messages[locale],
        ...strings
      };
    }
    this.addPowercordStrings();
  }
};
