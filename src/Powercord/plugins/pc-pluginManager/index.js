const { Plugin } = require('powercord/entities');
const { resolve } = require('path');

const Settings = require('./components/Settings.jsx');

module.exports = class PluginManager extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));
    this.registerSettings('pc-pluginManager', 'Plugins', Settings);
  }
};
