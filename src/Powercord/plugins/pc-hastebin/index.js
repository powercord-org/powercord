const { Plugin } = require('powercord/entities');
const { get, post } = require('powercord/http');
const { clipboard } = require('electron');
const { React } = require('powercord/webpack');

const Settings = require('./Settings.jsx');

module.exports = class Hastebin extends Plugin {
  startPlugin () {
    this.registerSettings('pc-hastebin', 'Hastebin', () =>
      React.createElement(Settings, {
        settings: this.settings
      })
    );

    const domain = this.settings.get('domain', 'https://haste.aetheryx.xyz');
    const prefix = powercord.pluginManager
      .get('pc-commands').settings
      .get('prefix', '.'); // @todo: make not ugly at time other than 4:30am

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'hastebin',
        'Lets you paste content to Hastebin.',
        '{c} [ --send ] < --clipboard | FILE_URL >',
        async (args) => {
          const send = args.includes('--send')
            ? !!args.splice(args.indexOf('--send'), 1)
            : this.settings.get('send', false);

          const data = args.includes('--clipboard')
            ? clipboard.readText()
            : await this.parseArguments(args);

          if (!data) {
            return {
              send: false,
              result: `Invalid arguments. Run \`${prefix}help hastebin\` for more information.`
            };
          }

          const { body } = await post(`${domain}/documents`)
            .send(data);

          return {
            send,
            result: `${domain}/${body.key}`
          };
        }
      );
  }

  pluginWillUnload () {
    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('hastebin');
  }

  parseArguments (args) {
    const input = args.join(' ');
    if (input.startsWith('https://cdn.discordapp.com/attachments')) {
      return get(input).then(res => res.raw);
    }

    return false;
  }
};
