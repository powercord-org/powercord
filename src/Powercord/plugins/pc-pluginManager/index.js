const { Plugin } = require('powercord/entities');
const { resolve } = require('path');

const Settings = require('./components/Settings.jsx');
const commands = require('./commands');

module.exports = class PluginManager extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));

    Object.values(commands).forEach(cmd =>
      this.registerCommand(cmd.command, cmd.aliases || [],
        cmd.description, cmd.usage,
        cmd.func, cmd.autocompleteFunc
      )
    );

    this.registerSettings('pc-pluginManager', 'Plugins', Settings);
  }
};
