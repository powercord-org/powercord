const { Plugin } = require('powercord/entities');

module.exports = class LMGTFY extends Plugin {
  startPlugin () {
    this.registerCommand(
      'lmgtfy',
      [],
      'Let me google that for you...',
      '{c} [ ...search terms ]',
      (args) => ({
        send: true,
        result: `<https://lmgtfy.com/?q=${encodeURI(args.join('+'))}>`
      })
    );
  }
};
