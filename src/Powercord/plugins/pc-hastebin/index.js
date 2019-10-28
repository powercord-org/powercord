const { Plugin } = require('powercord/entities');
const { get, post } = require('powercord/http');
const { clipboard } = require('electron');

const Settings = require('./Settings.jsx');

module.exports = class Hastebin extends Plugin {
  startPlugin () {
    this.registerSettings('pc-hastebin', 'Hastebin', Settings);

    const domain = this.settings.get('domain', 'https://hasteb.in');
    this.registerCommand(
      'hastebin',
      [],
      'Lets you paste content to Hastebin',
      '{c} [--send] <--clipboard | FILE_URL>',
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
            result: `Invalid arguments. Run \`${powercord.api.commands.prefix}help hastebin\` for more information.`
          };
        }

        try {
          const { body } = await post(`${domain}/documents`)
            .send(data);
          return {
            send,
            result: `${domain}/${body.key}`
          };
        } catch (e) {
          return {
            send: false,
            result: `Upload to the specifified domain ${domain} failed. Please check that the server is setup properly.`
          };
        }
      }
    );
  }

  parseArguments (args) {
    const input = args.join(' ');
    if (input.startsWith('https://cdn.discordapp.com/attachments')) {
      return get(input).then(res => res.raw);
    }

    return false;
  }
};
