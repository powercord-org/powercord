const Plugin = require('powercord/Plugin');
const { resolve } = require('path');

const Settings = require('./components/Settings.jsx');

module.exports = class PluginManager extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));

    powercord
      .pluginManager
      .get('pc-settings')
      .register('pc-pluginManager', 'Plugins', Settings);
  }

  unload () {
    this.unloadCSS();
    powercord
      .pluginManager
      .get('pc-settings')
      .unregister('pc-pluginManager');
  }
};
