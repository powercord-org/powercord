const { Plugin } = require('powercord/entities');
const commands = require('./commands');

const TAG_ARGUMENT_REGEX = /\$\$(@|\d+)/g;

module.exports = class Tags extends Plugin {
  startPlugin () {
    this.registerMain();
    this.registerTags();
  }

  pluginWillUnload () {
    this.unregisterTags();
  }

  registerMain () {
    this.registerCommand(
      'tag',
      [],
      'Send, preview and manage your tags',
      '{c} <view|list|add|edit|delete> <tagName> [tagContent]',
      (args) => {
        const subcommand = commands[args[0]];
        if (!subcommand) {
          return {
            send: false,
            result: `\`${args[0]}\` is not a valid subcommand. Specify one of ${Object.keys(commands).map(cmd => `\`${cmd}\``).join(', ')}.`
          };
        }

        return subcommand.func(args.slice(1), this);
      },
      (args) => {
        if (args[0] !== void 0 && args.length === 1) {
          return {
            commands: Object.values(commands).filter(({ command }) => command.includes(args[0].toLowerCase())),
            header: 'tag subcommands'
          };
        }

        const subcommand = commands[args[0]];
        if (!subcommand) {
          return false;
        }

        return subcommand.autocomplete(args.slice(1), this.settings);
      }
    );
  }

  registerTags () {
    for (const tag of this.settings.getKeys()) {
      this.registerTag(tag);
    }
  }

  registerTag (name) {
    const content = this.settings.get(name);

    powercord.api.commands.registerCommand(
      name,
      [],
      `Tag: ${content}`,
      `Tag: ${content}`,
      (args) => ({
        send: true,
        result: content.replace(TAG_ARGUMENT_REGEX, (match, idx) => (
          match === '$$@'
            ? args.join(' ')
            : args[idx - 1]
        ))
      })
    );
  }

  unregisterTags () {
    for (const tag of this.settings.getKeys()) {
      this.registerTag(tag);
    }
  }

  unregisterTag (name) {
    powercord.api.commands.unregisterCommand(name);
  }

  reloadTag (name) {
    this.unregisterTag(name);
    this.registerTag(name);
  }
};
