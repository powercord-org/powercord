const { API } = require('powercord/entities');

module.exports = class Commands extends API {
  constructor () {
    super();

    this.commands = [];
  }

  get prefix () {
    return powercord.settings.get('prefix', '.');
  }

  registerCommand (command, aliases, description, usage, func) {
    if (!command.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a command with an invalid name! You can only use letters, numbers, dashes and underscores. (${command})`);
    }

    if (this.commands.find(c => c.command === command || c.aliases.includes(command))) {
      return this.error(`Command name ${command} is already used by another plugin!`);
    }

    aliases = aliases.filter(alias => {
      if (!alias.match(/^[a-z0-9_-]+$/i)) {
        this.error(`Tried to register a command alias with an invalid name! You can only use letters, numbers, dashes and underscores. Alias will be ignored. (${alias})`);
        return false;
      }
      if (this.commands.find(c => c.command === alias || c.aliases.includes(alias))) {
        this.error(`Command alias ${alias} is already used by another plugin! Alias will be ignored.`);
        return false;
      }
      return true;
    });

    return this.commands.push({
      command,
      aliases,
      description,
      usage,
      func
    });
  }

  unregisterCommand (command) {
    this.commands = this.commands.filter(c => c.command !== command);
  }
};
