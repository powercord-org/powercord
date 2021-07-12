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
    getModule([ 'locale', 'theme' ]).then(module => {
      this.locale = module.locale;
      module.addChangeListener(() => {
        if (module.locale !== this.locale) {
          this.locale = module.locale;
          i18n.loadPromise.then(() => this.addPowercordStrings());
        }
      });
      this.addPowercordStrings();
    });
  }

  addPowercordStrings () {
    const i18nContextProvider = i18n._provider?._context || i18n._proxyContext;

    Object.assign(i18nContextProvider.messages, this.messages[this.locale]);
    Object.assign(i18nContextProvider.defaultMessages, this.messages['en-US']);

    // begone annoying warning
    [ 'messages', 'defaultMessages' ].forEach(obj => {
      Object.keys(i18nContextProvider[obj]).filter(key => key.startsWith('SELF_XSS')).forEach(key => delete i18nContextProvider[obj][key]);
    });
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
