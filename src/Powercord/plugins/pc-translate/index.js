const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { ReactDOM, React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { sleep, createElement, forceUpdateElement, getOwnerInstance } = require('powercord/util');
const { ContextMenu: { Submenu } } = require('powercord/components');

const Settings = require('./components/Settings');
const translate = require('google-translate-api');
const { resolve } = require('path');

module.exports = class Translate extends Plugin {
  async startPlugin () {
    this.state = {};
    this.translations = {};
    this.messageClasses = {
      ...await getModule([ 'container', 'messageCompact' ]),
      ...await getModule([ 'markup' ])
    };

    Object.keys(this.messageClasses)
      .forEach(key => this.messageClasses[key] = `.${this.messageClasses[key].replace(/ /g, '.')}`);

    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.registerSettings('pc-translate', 'Translate', props => React.createElement(Settings, {
      ...props,
      main: this
    }));

    this._injectTranslator();
  }

  pluginWillUnload () {
    this.removeResetButton();

    uninject('pc-translate-nativeContext');
    uninject('pc-translate-context');
    uninject('pc-translate-content');
    uninject('pc-translate-contentRemove');
    uninject('pc-translate-resetButtonRemove');
  }

  async _injectTranslator () {
    this.state.languages = Object.keys(translate.languages)
      .filter(k => typeof translate.languages[k] === 'string');

    const _this = this;
    const MessageContent = await getModuleByDisplayName('MessageContent');
    inject('pc-translate-contentRemove', MessageContent.prototype, 'componentWillUnmount', function () {
      const { message, message: { embeds } } = this.props;
      const embed = embeds.length > 0 ? embeds[0] : null;

      if (embed && _this.translations[embed.id]) {
        embed.title = embed.original.title;
        embed.description = embed.original.description;
      } else if (_this.translations[message.id]) {
        message.contentParsed = message.original;
      }

      _this.translations[(embed ? embed : message).id] = null;
    });

    inject('pc-translate-content', MessageContent.prototype, 'render', function (args) {
      const { message, message: { embeds } } = this.props;
      const embed = embeds.length > 0 ? embeds[0] : null;

      if (embed) {
        if (_this.translations[embed.id] && !embed.original) {
          // eslint-disable-next-line object-property-newline
          embed.original = { title: embed.title, description: embed.description };
          embed.title = _this.translations[embed.id].title;
          embed.description = _this.translations[embed.id].description;
        } else if (!_this.translations[embed.id] && embed.original) {
          embed.title = embed.original.title;
          embed.description = embed.original.description;
          embed.original = null;
        }
      }

      if (_this.translations[message.id] && !message.original) {
        message.original = [ ...message.contentParsed ];

        if (message.contentParsed.length > 1) {
          const newContentParsed = message.contentParsed.map((content, index) => {
            const translations = _this.translations[message.id];

            if (typeof content === 'string') {
              if (translations.find(translation => content === translation.original)) {
                const { translation } = translations.find(translation => content === translation.original);
                message.contentParsed[index] = translation;
              }
            }

            return message.contentParsed[index];
          });

          message.contentParsed = newContentParsed;
        } else {
          message.contentParsed = [ _this.translations[message.id] ];
        }
      } else if (!_this.translations[message.id] && message.original) {
        message.contentParsed = message.original;
        message.original = null;
      }

      return args;
    }, true);

    const ChannelTextArea = await getModuleByDisplayName('ChannelTextArea');
    inject('pc-translate-resetButtonRemove', ChannelTextArea.prototype, 'handleSubmit', (args) => {
      this.removeResetButton();

      return args;
    });

    const NativeContextMenu = await getModuleByDisplayName('NativeContextMenu');
    inject('pc-translate-nativeContext', NativeContextMenu.prototype, 'render', function (_, res) {
      if (this.props.type !== 'CHANNEL_TEXT_AREA') {
        return res;
      }

      const { _textArea: target } = getOwnerInstance(this.props.target);
      _this.state.original = _this.state.original || target.value;

      const setText = async (opts) => {
        const { messagesWrapper } = (await getModule([ 'messagesWrapper' ]));
        const buttonClasses = (await getModule([ 'channelTextArea', 'inner' ]));

        const textArea = getOwnerInstance(document.querySelector(`.${messagesWrapper.replace(/ /g, '.')} + form`));
        const selectedText = (await getModule([ 'getSelectionText' ])).getSelectionText();

        let value = selectedText.length > 0 ? selectedText : target.value;

        const { text } = await translate(value, opts);

        if (selectedText.length === 0) {
          value = text;
        } else {
          value = `${target.value.slice(0, target.selectionStart)}${text}` +
            `${target.value.slice(target.selectionEnd)}`;
        }

        textArea.setState({ textValue: value });

        if (document.getElementById('powercord-translate-resetButton')) {
          return;
        }

        const textAreaButtons = document.getElementsByClassName(buttonClasses.buttons)[0];
        const buttonContainer = createElement('div', { id: 'powercord-translate-resetButton',
          className: buttonClasses.buttonContainer });

        textAreaButtons.insertBefore(buttonContainer, textAreaButtons.firstChild);

        const ResetButton = require('./components/ResetButton.jsx');
        ReactDOM.render(React.createElement(ResetButton, {
          onClick: () => {
            textArea.setState({ textValue: _this.state.original });

            _this.removeResetButton();
          }
        }), buttonContainer);
      };

      _this.addTranslateSubMenu(res, setText);

      return res;
    });

    const MessageContextMenu = await getModuleByDisplayName('MessageContextMenu');
    inject('pc-translate-context', MessageContextMenu.prototype, 'render', function (_, res) {
      const { containerCozyBounded, timestampCozy, markup } = _this.messageClasses;
      const setText = async (opts) => {
        const cozy = !!this.props.target.closest(containerCozyBounded);
        const message = cozy ? this.props.target.closest(containerCozyBounded) : this.props.target.parentElement.parentElement;

        message.style.transition = '0.2s';
        message.style.opacity = '0';

        let fromLang = '';

        const timestamp = cozy ? message.querySelector(timestampCozy) : message;
        await Promise.all([
          sleep(200),
          Promise.all(
            [ ...message.querySelectorAll(markup) ]
              .map(async (markup) => {
                const markupInstance = getOwnerInstance(markup);
                const { embed, message } = markupInstance.props;

                if (embed || (message && message.embeds.length > 0)) {
                  const embed = markupInstance.props.embed || message.embeds[0];

                  _this.translations[embed.id] = [];

                  if (embed.title) {
                    const { text } = await translate(embed.title, opts);
                    _this.translations[embed.id].title = text;
                  }

                  const { text, from } = await translate(embed.description, opts);

                  _this.translations[embed.id].description = text;
                  fromLang = translate.languages[from.language.iso];
                }

                let content;

                if (message) {
                  if (message.contentParsed.length > 1) {
                    const contentArray = [];
                    const contentStrings = message.contentParsed.filter(content => typeof content === 'string');

                    contentStrings.map(async (content) => {
                      const { text, from } = await translate(content, opts);

                      fromLang = translate.languages[from.language.iso];
                      contentArray.push({ original: content,
                        translation: content.startsWith(' ') && content.endsWith(' ')
                          ? ` ${text} `
                          : content.startsWith(' ') ? ` ${text}` : content.endsWith(' ') ? `${text} ` : text });

                      return contentArray;
                    });

                    while (contentArray.length !== contentStrings.length) {
                      await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    content = contentArray;
                  } else {
                    const { text, from } = await translate(
                      message.contentParsed.filter(content => typeof content === 'string').join(''),
                      opts
                    );

                    fromLang = translate.languages[from.language.iso];
                    content = text;
                  }

                  _this.translations[message.id] = content;
                }

                forceUpdateElement(_this.messageClasses.markup, true);
              })
          )
        ]);

        if (!timestamp.innerHTML.includes('Translated from')) {
          const translateReset = createElement('span', {
            innerHTML: `(Translated from ${fromLang})`,
            className: 'powercord-translate-reset',
            async onclick () {
              message.style.opacity = '0';
              await sleep(200);

              message.querySelectorAll(markup)
                .forEach(markup => {
                  const markupInstance = getOwnerInstance(markup);
                  const { embed, message } = markupInstance.props;

                  if (embed || (message && message.embeds.length > 0)) {
                    const embed = markupInstance.props.embed || message.embeds[0];
                    _this.translations[embed.id] = null;
                  }

                  if (message) {
                    _this.translations[message.id] = null;
                  }

                  forceUpdateElement(_this.messageClasses.markup, true);
                });

              timestamp.removeChild(cozy ? this : this.parentElement);
              message.style.opacity = '1';
            }
          });
          if (cozy) {
            timestamp.appendChild(translateReset);
          } else {
            const translateResetContainer = createElement('div', {
              className: 'powercord-translate-reset-compact-container'
            });
            translateResetContainer.appendChild(translateReset);
            timestamp.appendChild(translateResetContainer);
          }
        }

        message.style.opacity = '1';
      };

      _this.addTranslateSubMenu(res, setText);

      return res;
    });
  }

  removeResetButton () {
    delete this.state.original;

    const resetButton = document.getElementById('powercord-translate-resetButton');
    if (resetButton) {
      resetButton.remove();
    }
  }

  addTranslateSubMenu (res, setText) {
    const get = (settingKey, defaultValue) => this.settings.get(settingKey, defaultValue);
    const usageHistory = get('usageHistory', {});
    const frequentlyUsed = Object.keys(usageHistory).sort((a, b) => usageHistory[a] - usageHistory[b]);
    const languages = this.state.languages
      .filter(lang => !get('hiddenLanguages', []).includes(lang))
      .sort((a, b) => get('sortByUsage', false)
        ? frequentlyUsed.indexOf(b) - frequentlyUsed.indexOf(a)
        : null);

    if (languages.indexOf('auto') > 0) {
      languages.splice(languages.indexOf('auto'), 1);
      languages.unshift('auto');
    }

    res.props.children.push(
      React.createElement(Submenu, {
        name: 'Translate',
        hint: 'to',
        seperate: true,
        onClick: () => setText({ to: 'en' }),
        getItems: () => languages
          .map(to => ({
            type: 'submenu',
            hint: 'from',
            name: translate.languages[to],
            onClick: () => {
              this.setUsageHistory(to);
              setText({ to });
            },
            getItems: () => languages
              .map(from => ({
                type: 'button',
                name: translate.languages[from],
                onClick: () => {
                  this.setUsageHistory(from);
                  setText({
                    to,
                    from
                  });
                }
              }))
          }))
      })
    );
  }

  setUsageHistory (lang) {
    const usageHistory = this.settings.get('usageHistory', {});
    usageHistory[lang] = !usageHistory.hasOwnProperty(lang) ? 1 : usageHistory[lang] += 1;

    if (lang !== 'auto') {
      this.settings.set('usageHistory', usageHistory);
    }
  }
};
