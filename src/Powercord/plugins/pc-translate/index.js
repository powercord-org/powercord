const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModuleByDisplayName, React } = require('powercord/webpack');
const { sleep, createElement, forceUpdateElement, getOwnerInstance } = require('powercord/util');
const { ContextMenu: { Submenu } } = require('powercord/components');
const translate = require('google-translate-api');
const { resolve } = require('path');

module.exports = class Translate extends Plugin {
  async startPlugin () {
    this.translations = {};
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._injectTranslator();
  }

  pluginWillUnload () {
    uninject('pc-translate-context');
    uninject('pc-translate-content');
    uninject('pc-translate-contentRemove');
  }

  async _injectTranslator () {
    const languages = Object.keys(translate.languages)
      .filter(k => typeof translate.languages[k] === 'string');

    const _this = this;
    const MessageContent = await getModuleByDisplayName('MessageContent');
    inject('pc-translate-contentRemove', MessageContent.prototype, 'componentWillUnmount', function () {
      const { message, message: { embeds } } = this.props;
      const embed = embeds.length > 0 ? embeds[0] : null;

      if (embed && _this.translations[embed.id]) {
        embed.description = embed.original;
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
          embed.original = embed.description;
          embed.description = _this.translations[embed.id];
        } else if (!_this.translations[embed.id] && embed.original) {
          embed.description = embed.original;
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

    const MessageContextMenu = await getModuleByDisplayName('MessageContextMenu');
    inject('pc-translate-context', MessageContextMenu.prototype, 'render', function (args, res) {
      const setText = async (opts) => {
        const cozy = !!this.props.target.closest('.pc-containerCozyBounded');
        const message = cozy ? this.props.target.closest('.pc-containerCozyBounded') : this.props.target.parentElement.parentElement;

        message.style.transition = '0.2s';
        message.style.opacity = '0';

        let fromLang = '';

        const timestamp = cozy ? message.querySelector('.pc-timestampCozy') : message;
        await Promise.all([
          sleep(200),
          Promise.all(
            [ ...message.querySelectorAll('.pc-markup') ]
              .map(async (markup) => {
                const markupInstance = getOwnerInstance(markup);
                const { embed, message } = markupInstance.props;

                if (embed || (message && message.embeds.length > 0)) {
                  const embed = markupInstance.props.embed || message.embeds[0];
                  const { text, from } = await translate(embed.description, opts);

                  _this.translations[embed.id] = text;
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

                forceUpdateElement('.pc-markup', true);
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

              message.querySelectorAll('.pc-markup')
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

                  forceUpdateElement('.pc-markup', true);
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
              onClick: () => setText({ to }),
              getItems: () => languages
                .map(from => ({
                  type: 'button',
                  name: translate.languages[from],
                  onClick: () => setText({
                    to,
                    from
                  })
                }))
            }))
        })
      );

      return res;
    });
  }
};
