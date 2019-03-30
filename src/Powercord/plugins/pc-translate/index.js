const { Plugin } = require('powercord/entities');
const { inject, uninject } = require('powercord/injector');
const { getModuleByDisplayName, React } = require('powercord/webpack');
const { sleep, createElement, getOwnerInstance } = require('powercord/util');
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
    this.unloadCSS();
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
      if (_this.translations[this.props.message.id]) {
        this.props.message.contentParsed = this.original;
        _this.translations[this.props.message.id] = null;
      }
    });

    inject('pc-translate-content', MessageContent.prototype, 'render', function (args) {
      if (_this.translations[this.props.message.id]) {
        this.original = [ ...this.props.message.contentParsed ];
        this.props.message.contentParsed = [ _this.translations[this.props.message.id] ];
      } else if (!_this.translations[this.props.message.id] && this.original) {
        this.props.message.contentParsed = this.original;
        this.original = null;
      }
      return args;
    }, true);

    const MessageContextMenu = await getModuleByDisplayName('MessageContextMenu');
    inject('pc-translate-context', MessageContextMenu.prototype, 'render', function (args, res) {
      const setText = async (opts) => {
        const message = this.props.target.closest('.pc-containerCozyBounded');

        message.style.transition = '0.2s';
        message.style.opacity = '0';

        let fromLang = '';

        const timestamp = message.querySelector('.pc-timestampCozy');
        await Promise.all([
          sleep(200),
          Promise.all(
            [ ...message.querySelectorAll('.pc-markup') ]
              .map(async (markup) => {
                const markupInstance = getOwnerInstance(markup);
                const { text, from } = await translate(markupInstance.props.message.contentParsed.filter(c => typeof c === 'string').join(''), opts);
                _this.translations[markupInstance.props.message.id] = text;
                fromLang = translate.languages[from.language.iso];
                markupInstance.forceUpdate();
              })
          )
        ]);

        if (!timestamp.innerHTML.includes('Translated from')) {
          timestamp.appendChild(
            createElement('span', {
              innerHTML: `(Translated from ${fromLang})`,
              className: 'powercord-translate-reset',
              async onclick () {
                message.style.opacity = '0';
                await sleep(200);

                message.querySelectorAll('.pc-markup')
                  .forEach(markup => {
                    const markupInstance = getOwnerInstance(markup);
                    _this.translations[markupInstance.props.message.id] = null;
                    markupInstance.forceUpdate();
                  });

                timestamp.removeChild(this);
                message.style.opacity = '1';
              }
            })
          );
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
