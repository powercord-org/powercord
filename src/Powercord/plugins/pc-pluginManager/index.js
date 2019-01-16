const Plugin = require('powercord/Plugin');
const { inject } = require('powercord/injector');
const { getModuleByDisplayName } = require('powercord/webpack');
const { resolve } = require('path');

const Settings = require('./components/Settings.jsx');

module.exports = class PluginManager extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'scss', 'style.scss'));

    powercord
      .pluginManager
      .get('pc-settings')
      .register('pc-pluginManager', 'Plugins', Settings);

    this._inject();
  }

  _inject () {
    const HeaderBar = getModuleByDisplayName('headerbar');

    inject('pc-pluginManager-reloadIcon', HeaderBar.prototype, 'render', (args, res) => {
      if (powercord.pluginManager.requiresReload) {
        res.props.children[3].props.children[2].props.children.push(
          Object.assign({}, res.props.children[3].props.children[2].props.children[3], {
            props: Object.assign({}, res.props.children[3].props.children[2].props.children[3].props, {
              children : Object.assign({}, res.props.children[3].props.children[2].props.children[3].props.children, {
                props: Object.assign({}, res.props.children[3].props.children[2].props.children[3].props.children.props, {
                  tooltip: 'Plugin Manager requires reload'
                })
              }),
              onClick: (e) => {
                e.preventDefault();
                window.location.reload();
              },
              className: 'pc-icon-reload'
            })
          })
        );
      }
      return res;
    });
  }
};
