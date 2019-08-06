const { Plugin } = require('powercord/entities');
const commands = require('./commands');

module.exports = class Tags extends Plugin {
  startPlugin () {
    this.registerCommand(
      'tag',
      [],
      'Send, preview and manage your tags',
      '/tag <send|view|list|add|edit|delete> <tagName> [tagContent]',
      (args) => {
        const subcommand = commands[args[0]];
        if (!subcommand) {
          return {
            send: false,
            result: `\`${args[0]}\` is not a valid subcommand. Specify one of ${Object.keys(commands).map(cmd => `\`${cmd}\``).join(', ')}.`
          };
        }

        return subcommand.func(args.slice(1), this.settings);
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
};
