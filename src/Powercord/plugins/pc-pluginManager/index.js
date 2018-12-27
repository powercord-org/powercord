const Plugin = require('powercord/Plugin');
const { getModuleByDisplayName } = require('powercord/webpack');

module.exports = class PluginManager extends Plugin {
  constructor () {
    super({
      dependencies: [ 'pc-settings' ]
    });
  }

  start () {
    // const settingsManager = powercord.pluginManager.get('pc-settings');
    this._inject();
  }

  _inject () {
    const HeaderBar = getModuleByDisplayName('headerbar');
    HeaderBar.prototype.render = ((_render) => function (...args) { // eslint-disable-line
      const res = _render.call(this, ...args);
      if (powercord.pluginManager.requiresReload) {
        res.props.children[3].props.children[2].props.children.push({
          ...res.props.children[3].props.children[2].props.children[3],
          props: {
            ...res.props.children[3].props.children[2].props.children[3].props,
            onClick: () => window.location.reload(),
            tooltip: 'Plugin Manager requires reload',
            className: 'pc-icon-reload'
          }
        });
      }
      return res;
    })(HeaderBar.prototype.render);
  }
};
