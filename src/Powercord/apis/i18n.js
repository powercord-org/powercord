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
    delete i18nContextProvider.messages.SELF_XSS_HEADER;
    delete i18nContextProvider.messages.SELF_XSS_LINE_1;
    delete i18nContextProvider.messages.SELF_XSS_LINE_2;
    delete i18nContextProvider.messages.SELF_XSS_LINE_3;
    delete i18nContextProvider.messages.SELF_XSS_LINE_4;

    delete i18nContextProvider.defaultMessages.SELF_XSS_HEADER;
    delete i18nContextProvider.defaultMessages.SELF_XSS_LINE_1;
    delete i18nContextProvider.defaultMessages.SELF_XSS_LINE_2;
    delete i18nContextProvider.defaultMessages.SELF_XSS_LINE_3;
    delete i18nContextProvider.defaultMessages.SELF_XSS_LINE_4;
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
