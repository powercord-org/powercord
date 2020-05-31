const { API } = require('powercord/entities');

/**
 * @typedef PowercordChatCommand
 * @property {String} command Command name
 * @property {String[]} aliases Command aliases
 * @property {String} description Command description
 * @property {String} usage Command usage
 * @property {Function} executor Command executor
 * @property {Function|undefined} autocomplete Autocompletion method
 * @property {Boolean|undefined} showTyping Whether typing status should be shown or not
 */

/**
 * Powercord chat commands API
 * @property {Object.<String, PowercordChatCommand>} commands Registered commands
 */
class CommandsAPI extends API {
  constructor () {
    super();

    this.commands = {};
  }

  get prefix () {
    return powercord.settings.get('prefix', '.');
  }

  get find () {
    const arr = Object.values(this.commands);
    return arr.find.bind(arr);
  }

  get filter () {
    const arr = Object.values(this.commands);
    return arr.filter.bind(arr);
  }

  get map () {
    const arr = Object.values(this.commands);
    return arr.map.bind(arr);
  }

  get sort () {
    const arr = Object.values(this.commands);
    return arr.sort.bind(arr);
  }

  /**
   * Registers a command
   * @param {PowercordChatCommand} command Command to register
   */
  registerCommand (command) {
    if (typeof command === 'string') {
      console.error('no');
      return;
    }
    if (this.commands[command.command]) {
      throw new Error(`Command ${command.command} is already registered!`);
    }

    this.commands[command.command] = command;
  }

  /**
   * Unregisters a command
   * @param {String} command Command name to unregister
   */
  unregisterCommand (command) {
    if (this.commands[command]) {
      delete this.commands[command];
    }
  }
}

module.exports = CommandsAPI;
