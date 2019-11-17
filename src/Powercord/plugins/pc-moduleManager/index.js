const { Plugin } = require('powercord/entities');
const { resolve } = require('path');

const layout = require('./components/manage/Layout.jsx');
const Soon = require('./components/Soon.jsx');
const commands = require('./commands');

module.exports = class ModuleManager extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));

    Object.values(commands).forEach(cmd =>
      this.registerCommand(cmd.command, cmd.aliases || [],
        cmd.description, cmd.usage,
        cmd.func, cmd.autocompleteFunc
      )
    );

    if (this.settings.get('__experimental_2019-10-25', false)) {
      this.log('Experimental Module Manager enabled.');
      this.registerSettings('pc-moduleManager-plugins', 'Plugins', layout('plugins', true));
      this.registerSettings('pc-moduleManager-themes', 'Themes', layout('themes', true));
    } else {
      this.registerSettings('pc-moduleManager-plugins', 'Plugins', layout('plugins', false));
      this.registerSettings('pc-moduleManager-themes', 'Themes', Soon);
    }
  }

  __toggleExperimental () {
    const current = this.settings.get('__experimental_2019-10-25', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental new module manager, that is NOT functional yet.');
      this.warn('WARNING: Powercord Staff won\'t accept bug reports from this experimental version, nor provide support!');
      this.warn('WARNING: Use it at your own risk! It\'s labeled experimental for a reason.');
    } else {
      this.log('Experimental Module Manager disabled.');
    }
    this.settings.set('__experimental_2019-10-25', !current);
    powercord.pluginManager.remount(this.entityID);
  }
};
