const Plugin = require('powercord/Plugin');

const commands = require('./commands');

module.exports = class Commands extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'webpack' ]
    });

    this.commands = new Map(Object.entries(commands));
  }

  async start () {
    this.prefix = powercord.config.prefix || '.';

    const monkeypatchMessages = require('./monkeypatchMessages.js');
    const injectAutocomplete = require('./injectAutocomplete.js');

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
