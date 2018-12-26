const Plugin = require('powercord/Plugin');

const commands = require('./commands');
const monkeypatchMessages = require('./monkeypatchMessages.js');
const injectAutocomplete = require('./injectAutocomplete.js');

module.exports = class Commands extends Plugin {
  constructor () {
    super();

    this.commands = new Map(Object.entries(commands));
  }

  get prefix () {
    return powercord.config.prefix || '.';
  }

  async start () {
    monkeypatchMessages.call(this);
    injectAutocomplete.call(this);
  }

  register (name, description, usage, func) {
    return this.commands.set(name, {
      description,
      usage,
      name,
      func
    });
  }
};
