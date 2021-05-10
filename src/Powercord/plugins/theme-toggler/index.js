const { Plugin } = require('powercord/entities');

const Settings = require('./components/Settings.jsx');
const i18n = require('./i18n');
const commands = require('./commands');

module.exports = class ThemeToggler extends Plugin {
    startPlugin() {
        this.registerMain()
        this.loadStylesheet('style.scss');
        powercord.api.i18n.loadAllStrings(i18n);
        powercord.api.settings.registerSettings('theme-toggler', {
            category: this.entityID,
            label: 'Theme Toggler',
            render: Settings
        });
    }

    pluginWillUnload() {
        powercord.api.settings.unregisterSettings('theme-toggler');
        powercord.api.commands.unregisterCommand('theme');
    }

    registerMain() {
        powercord.api.commands.registerCommand({
            command: 'theme',
            description: 'Enable and disable a theme.',
            usage: '{c} [ enable, disable ] [ theme ID ]',
            executor: (args) => {
              const subcommand = commands[args[0]];
              if (!subcommand) {
                return {
                  send: false,
                  result: `\`${args[0]}\` is not a valid subcommand. Specify one of ${Object.keys(commands).map(cmd => `\`${cmd}\``).join(', ')}.`
                };
              }
      
              return subcommand.executor(args.slice(1), this);
            },
            autocomplete: (args) => {
              if (args[0] !== void 0 && args.length === 1) {
                return {
                  commands: Object.values(commands).filter(({ command }) => command.includes(args[0].toLowerCase())),
                  header: 'theme subcommands'
                };
              }
      
              const subcommand = commands[args[0]];
              if (!subcommand || !subcommand.autocomplete) {
                return false;
              }
      
              return subcommand.autocomplete(args.slice(1), this.settings);
            }
          });
    }
}