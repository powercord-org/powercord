const Plugin = require('powercord/Plugin');
const { getModuleByDisplayName } = require('powercord/webpack');
const { resolve } = require('path');

const Settings = require('./components/Settings.jsx');

module.exports = class PluginManager extends Plugin {
  constructor () {
    super({
      dependencies: [ 'pc-settings' ]
    });
  }

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

    // eslint-disable-next-line func-names
    HeaderBar.prototype.render = (_render => function (...args) {
      const res = _render.call(this, ...args);
      if (powercord.pluginManager.requiresReload) {
        res.props.children[3].props.children[2].props.children.push(
          Object.assign({}, res.props.children[3].props.children[2].props.children[3], {
            props: Object.assign({}, res.props.children[3].props.children[2].props.children[3].props, {
              onClick: () => window.location.reload(),
              tooltip: 'Plugin Manager requires reload',
              className: 'pc-icon-reload'
            })
          })
        );
      }
      return res;
    })(HeaderBar.prototype.render);
  }
};
