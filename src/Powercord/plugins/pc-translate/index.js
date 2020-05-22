const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { ReactDOM, React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { sleep, createElement, forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { ContextMenu: { Submenu } } = require('powercord/components');

const Settings = require('./components/Settings');
const translate = require('google-translate-api');
const { resolve } = require('path');

module.exports = class Translate extends Plugin {
  async startPlugin () {
    // @todo: restore to its former glory (i.e. rewrite codebase as it's nothing but an absolute shitfest)
    return;

    /* eslint-disable no-unreachable */
    // noinspection UnreachableCodeJS
    this.state = {};
    this.translations = {};
    this.messageClasses = {
      ...await getModule([ 'container', 'messageCompact' ]),
      ...await getModule([ 'markup' ])
    };

    Object.keys(this.messageClasses)
      .forEach(key => this.messageClasses[key] = `.${this.messageClasses[key].split(' ')[0]}`);

    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.registerSettings('pc-translate', 'Translate', props => React.createElement(Settings, {
      ...props,
      main: this
    }));

    this._injectTranslator();
  }

  pluginWillUnload () {
    this.removeResetButton();

    // uninject('pc-translate-icon');
    uninject('pc-translate-slateContext');
    uninject('pc-translate-context');
    uninject('pc-translate-content');
    uninject('pc-translate-contentRemove');
    uninject('pc-translate-clearRestore');
  }

  async _injectTranslator () {
    this.state.languages = Object.keys(translate.languages)
      .filter(k => typeof translate.languages[k] === 'string');

    const _this = this;

    /*
     * const HeaderIcon = require('./components/HeaderIcon.jsx');
     * const HeaderBarContainer = await getModuleByDisplayName('HeaderBarContainer');
     * inject('pc-translate-icon', HeaderBarContainer.prototype, 'renderLoggedIn', function (_, res) {
     *  if (this.props.toolbar && !this.props.toolbar.props) {
     *   this.props.toolbar.unshift(
     *      React.createElement(HeaderIcon, {
     *        onClick: () => null,
     *        main: _this
     *      })
     *    );
     *  }
     *
     *  return res;
     * });
     */

    const MessageContent = await getModuleByDisplayName('MessageContent');
    inject('pc-translate-contentRemove', MessageContent.prototype, 'componentWillUnmount', function () {
      const { message, message: { embeds } } = this.props;
      const embed = embeds.length > 0 ? embeds[0] : null;

      if (embed && _this.translations[embed.id]) {
        embed.title = embed.original.title;
        embed.description = embed.original.description;
      } else if (_this.translations[message.id]) {
        this.props.content = message.original;
      }

      _this.translations[(embed ? embed : message).id] = null;
    });

    inject('pc-translate-content', MessageContent.prototype, 'render', function (args) {
      const { message, message: { embeds } } = this.props;
      const embed = embeds.length > 0 ? embeds[0] : null;

      if (embed) {
        if (_this.translations[embed.id] && !embed.original) {
          // eslint-disable-next-line object-property-newline
          embed.original = {
            title: embed.title,
            description: embed.description
          };
          embed.title = _this.translations[embed.id].title;
          embed.description = _this.translations[embed.id].description;
        } else if (!_this.translations[embed.id] && embed.original) {
          embed.title = embed.original.title;
          embed.description = embed.original.description;
          embed.original = null;
        }
      }

      if (_this.translations[message.id] && !message.original) {
        message.original = [ ...this.props.content ];

        if (this.props.content.length > 1) {
          this.props.content = this.props.content.map((content, index) => {
            const translations = _this.translations[message.id];

            if (typeof content === 'string') {
              if (translations.find(translation => content === translation.original)) {
                const { translation } = translations.find(translation => content === translation.original);
                this.props.content[index] = translation;
              }
            }

            return this.props.content[index];
          });
        } else {
          this.props.content = [ _this.translations[message.id] ];
        }
      } else if (!_this.translations[message.id] && message.original) {
        this.props.content = message.original;
        message.original = null;
      }

      return args;
    }, true);

    const ChannelEditorContainer = await getModuleByDisplayName('ChannelEditorContainer');
    inject('pc-translate-clearRestore', ChannelEditorContainer.prototype, 'componentDidUpdate', (args, res) => {
      if (args[0].textValue.length <= 1 || args[1].submitting) {
        this.removeResetButton();
      }

      return res;
    });

    const SlateContextMenu = await getModule(m => m.default && m.default.displayName === 'SlateContextMenu');
    inject('pc-translate-slateContext', SlateContextMenu, 'default', (args, res) => {
      const channelEditorContainer = args[0].editor._reactInternalFiber.return;
      const { memoizedProps: { textValue } } = channelEditorContainer;

      this.state.original = this.state.original || textValue;

      const setText = async (opts) => {
        const classes = {
          ...await getModule([ 'uploadModal' ]),
          ...await getModule([ 'messagesWrapper' ]),
          ...await getModule([ 'channelTextArea', 'inner' ])
        };

        const { deserialize } = await getModule([ 'deserialize' ]);
        const textArea = getOwnerInstance(await waitFor(`.${classes.messagesWrapper.split(' ')[0]} + form .${classes.channelTextArea.split(' ')[0]}`));
        const selectedText = args[0].editor.getSelectedText();
        const uploadModal = document.querySelector(`.${classes.uploadModal.split(' ')[0]}`)
          ? getOwnerInstance(document.querySelector(`.${classes.uploadModal.split(' ')[0]}`))
          : null;

        let value = selectedText.length > 0 ? selectedText : textValue;

        const { text } = await translate(value, opts);

        if (selectedText.length === 0) {
          value = text;
        } else {
          const selection = {
            start: args[0].editor.editorRef.value.selection.start.offset,
            end: args[0].editor.editorRef.value.selection.end.offset
          };

          value = `${textValue.slice(0, selection.start)}${text}` +
            `${textValue.slice(selection.end)}`;
        }

        (uploadModal !== null ? uploadModal : textArea).setState({
          textValue: value,
          richValue: deserialize(value)
        });

        if (document.getElementById('powercord-translate-resetButton')) {
          return;
        }

        const textAreaButtons = document.getElementsByClassName(classes.buttons)[uploadModal !== null ? 1 : 0];
        const buttonContainer = createElement('div', { id: 'powercord-translate-resetButton',
          className: classes.buttonContainer });

        textAreaButtons.insertBefore(buttonContainer, textAreaButtons.firstChild);

        const ResetButton = require('./components/ResetButton.jsx');
        ReactDOM.render(React.createElement(ResetButton, {
          onClick: () => {
            (uploadModal !== null ? uploadModal : textArea).setState({
              textValue: this.state.original,
              richValue: deserialize(this.state.original)
            });

            this.removeResetButton();
          }
        }), buttonContainer);
      };

      this.addTranslateSubMenu(res, setText);

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
                const { embed, message, content: contentParsed } = markupInstance.props;

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
                  if (contentParsed.length > 1) {
                    const contentArray = [];
                    const contentStrings = contentParsed.filter(content => typeof content === 'string');

                    contentStrings.map(async (content) => {
                      const { text, from } = await translate(content, opts);

                      fromLang = translate.languages[from.language.iso];
                      contentArray.push({
                        original: content,
                        translation: content.startsWith(' ') && content.endsWith(' ')
                          ? ` ${text} `
                          : content.startsWith(' ') ? ` ${text}` : content.endsWith(' ') ? `${text} ` : text
                      });

                      return contentArray;
                    });

                    while (contentArray.length !== contentStrings.length) {
                      await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    content = contentArray;
                  } else {
                    const { text, from } = await translate(
                      contentParsed.filter(content => typeof content === 'string').join(''),
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
      .sort((a, b) => {
        if (b === 'auto') {
          return 1;
        }

        return get('sortByUsage', false)
          ? frequentlyUsed.indexOf(b) - frequentlyUsed.indexOf(a)
          : null;
      });

    res.props.children.push(
      React.createElement(Submenu, {
        name: 'Translate',
        hint: 'to',
        separate: true,
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
