const Plugin = require('@ac/plugin');
const { get, post } = require('@ac/http');
const { clipboard } = require('electron');

module.exports = class Hastebin extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'commands' ]
    });

    this.DOMAIN = 'https://haste.aetheryx.xyz';
  }

  start () {
    aethcord
      .plugins.get('commands')
      .register(
        'hastebin',
        'Lets you paste content to Hastebin.',
        '/hastebin [ --send ] < --clipboard | FILE_URL >',
        async (args) => {
          const send = args.includes('--send')
            ? !!args.splice(args.indexOf('--send'), 1)
            : false;

          const { body } = await post(`${this.DOMAIN}/documents`)
            .send(
              args.includes('--clipboard')
                ? clipboard.readText()
                : await this.parseArguments(args)
            );

          return {
            send,
            result: `${this.DOMAIN}/${body.key}`
          };
        }
      );
  }

  async parseArguments (args) {
    const input = args.join(' ');
    if (input.startsWith('https://cdn.discordapp.com/attachments')) {
      return get(input).then(res => res.raw);
    }
  }
};
