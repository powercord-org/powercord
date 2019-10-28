const { Plugin } = require('powercord/entities');
const { resolve } = require('path');

const Soon = require('./components/Soon.jsx');
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


    if (this.settings.get('__experimental_2019-10-25', false)) {
      this.registerSettings('pc-pluginManager', 'Plugins', Settings);
    } else {
      this.registerSettings('pc-pluginManager', 'Plugins', Soon);
    }
  }

  __toggleExperimental () {
    const current = this.settings.get('__experimental_2019-10-25', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental new plugin manager, that is NOT functional yet.');
      this.warn('WARNING: Powercord Staff won\'t accept bug reports from this experimental version, nor provide support!');
      this.warn('WARNING: Use it at your own risk! It\'s labeled experimental for a reason.');
    } else {
      this.log('Experimental Plugin Manager disabled.');
    }
    this.settings.set('__experimental_2019-10-25', !current);
    powercord.pluginManager.remount(this.entityID);
  }
};
