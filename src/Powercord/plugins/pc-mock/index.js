const { Plugin } = require('powercord/entities');

module.exports = class Mock extends Plugin {
  startPlugin () {
    powercord.api.commands.registerCommand({
      command: 'mock',
      description: 'Mock a user...',
      usage: '{c} [text to mock]',
      executor: (args) => ({
        send: true,
        result: args.join(' ').split('').map((c, i) => i % 2 ? c.toUpperCase() : c).join('')
      })
    });
  }

  pluginWillUnload () {
    powercord.api.commands.unregisterCommand('mock');
  }
};
