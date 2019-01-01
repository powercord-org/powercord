const Plugin = require('powercord/Plugin');

module.exports = class LMGTFY extends Plugin {
  start () {
    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'lmgtfy',
        'Let me google that for you...',
        '{c} [ ...search terms ]',
        (args) => ({
          send: true,
          result: `<https://lmgtfy.com/?q=${encodeURI(args.join('+'))}>`
        })
      );
  }
};
