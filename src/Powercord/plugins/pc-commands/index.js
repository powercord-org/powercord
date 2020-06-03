const { Plugin } = require('powercord/entities');
const { uninject } = require('powercord/injector');

const commands = require('./commands');
const monkeypatchMessages = require('./monkeypatchMessages.js');
const injectAutocomplete = require('./injectAutocomplete.js');

module.exports = class Commands extends Plugin {
  startPlugin () {
    Object.values(commands).forEach(command => powercord.api.commands.registerCommand(command));

    monkeypatchMessages.call(this);
    injectAutocomplete.call(this);
  }

  pluginWillUnload () {
    Object.values(commands).forEach(command => powercord.api.commands.unregisterCommand(command.command));
    uninject('pc-commands-autocomplete-prefix');
    uninject('pc-commands-autocomplete');
  }
};
