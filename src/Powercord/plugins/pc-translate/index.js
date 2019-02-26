const Plugin = require('powercord/Plugin');
const { inject, uninject } = require('powercord/injector');
const { getModuleByDisplayName, React } = require('powercord/webpack');
const { sleep, createElement } = require('powercord/util');
const { ContextMenu: { Submenu } } = require('powercord/components');
const translate = require('google-translate-api');
const { resolve } = require('path');

module.exports = class Translate extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._injectTranslator();
  }

  unload () {
    this.unloadCSS();
    uninject('pc-translate-context');
  }

  async _injectTranslator () {
    const languages = Object.keys(translate.languages)
      .filter(k => typeof translate.languages[k] === 'string');

    const MessageContextMenu = await getModuleByDisplayName('messagecontextmenu');
    // @todo: Inject into MessageContent component to update only raw contents and keep formatting (requires injecting before Discord's code, #78)
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
                const { text, from } = await translate(markup.innerText, opts);
                if (!timestamp.innerHTML.includes('Translated from')) {
                  markup.dataset.original = markup.innerHTML;
                }
                markup.innerText = text;
                fromLang = translate.languages[from.language.iso];
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
                    if (markup.dataset.original) {
                      markup.firstChild.nodeValue = markup.dataset.original;
                    }
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
