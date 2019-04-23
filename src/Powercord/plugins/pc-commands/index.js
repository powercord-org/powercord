const { Plugin } = require('powercord/entities');
const { uninject } = require('powercord/injector');

const commands = require('./commands');
const monkeypatchMessages = require('./monkeypatchMessages.js');
const monkeypatchTyping = require('./monkeypatchTyping.js');
const injectAutocomplete = require('./injectAutocomplete.js');

module.exports = class Commands extends Plugin {
  startPlugin () {
    Object.values(commands).forEach(command =>
      this.registerCommand(command.command, command.aliases || [], command.description, command.usage, command.func)
    );

    monkeypatchMessages.call(this);
    injectAutocomplete.call(this);
    monkeypatchTyping.call(this);
  }

  pluginWillUnload () {
    uninject('pc-commands-autocomplete');
  }
};
