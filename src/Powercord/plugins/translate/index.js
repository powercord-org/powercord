const Plugin = require('powercord/Plugin');
const { getModuleByDisplayName, React } = require('powercord/webpack');
const { sleep } = require('powercord/util');
const { ContextMenu: { Submenu } } = require('powercord/components');
const index = require('@k3rn31p4nic/google-translate-api');

module.exports = class Translate extends Plugin {
  async start () {
    const languages = Object.keys(index.languages)
      .filter(k => typeof index.languages[k] === 'string');

    const MessageContextMenu = getModuleByDisplayName('messagecontextmenu');
    MessageContextMenu.prototype.render = (_render => function (...args) { // eslint-disable-line
      const res = _render.call(this, ...args);

      const setText = async (opts) => {
        const message = this.props.target.closest('.pc-containerCozyBounded');

        message.style.transition = '0.2s';
        message.style.opacity = '0';

        let fromLang;

        await Promise.all([
          sleep(200),
          Promise.all(
            [ ...message.querySelectorAll('.pc-markup') ]
              .map(async (markup) => {
                const { text, from } = await index(markup.innerText, opts);
                markup.innerText = text;
                fromLang = index.languages[from.language.iso];
              })
          )
        ]);

        const timestamp = message.querySelector('.pc-timestampCozy');
        if (!timestamp.innerHTML.includes('Translated from')) {
          timestamp.innerHTML += ` - Translated from ${fromLang}`;
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
              name: index.languages[to],
              onClick: () => setText({ to }),
              getItems: () => languages
                .map(from => ({
                  type: 'button',
                  name: index.languages[from],
                  onClick: () => setText({
                    to,
                    from
                  })
                }))
            }))
        })
      );

      return res;
    })(MessageContextMenu.prototype.render);
  }
};
