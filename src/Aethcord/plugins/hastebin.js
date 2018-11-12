const Plugin = require('@ac/plugin');
const { post } = require('@ac/http');
const { clipboard } = require('electron');

module.exports = class Hastebin extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'commands' ]
    });
  }

  start () {
    aethcord
      .plugins.get('commands')
      .register(
        'hastebin',
        async (args) => {
          const send = args.includes('--send')
            ? !!args.splice(args.indexOf('--send'), 1)
            : false;

          const { body } = await post('https://haste.aetheryx.xyz/documents')
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .send(
              args.includes('--clipboard')
                ? clipboard.readText()
                : 'ass' // todo: actually parse arguments :thinking:
            );

          return {
            send,
            result: `https://haste.aetheryx.xyz/${body.key}`
          };
        }
      )
  }
}