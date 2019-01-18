const Plugin = require('powercord/Plugin');

module.exports = class Mock extends Plugin {
  start () {
    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'mock',
        'Mock a user...',
        '{c} [ text to mock ]',
        (args) => ({
          send: true,
          result: args.join(' ').split('').map((c, i) => i % 2 ? c.toUpperCase() : c).join('')
        })
      );
  }

  unload () {
    powercord
      .pluginManager
      .get('pc-commands')
      .unregister('mock');
  }
};
