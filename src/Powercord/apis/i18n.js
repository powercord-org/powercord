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
    let { messages, defaultMessages } = i18nContextProvider;

    Object.defineProperty(i18nContextProvider, 'messages', {
      enumerable: true,
      get: () => messages,
      set: (v) => {
        messages = Object.assign(v, this.messages[this.locale]);
      }
    });
    Object.defineProperty(i18nContextProvider, 'defaultMessages', {
      enumerable: true,
      get: () => defaultMessages,
      set: (v) => {
        defaultMessages = Object.assign(v, this.messages['en-US']);
      }
    });

    i18nContextProvider.messages = messages;
    i18nContextProvider.defaultMessages = defaultMessages;
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
