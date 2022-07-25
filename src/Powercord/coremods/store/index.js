const { join } = require('path');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName, FluxDispatcher, constants: { Permissions }, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { Plugin: PluginIcon, Theme } } = require('powercord/components');
const { SpecialChannels: { STORE_PLUGINS, STORE_THEMES } } = require('powercord/constants');
const { forceUpdateElement } = require('powercord/util');
const { loadStyle, unloadStyle } = require('../util');

const Sidebar = require('./components/Sidebar');
const Store = require('./components/Store');

async function injectChannels () {
  const permissionsModule = await getModule([ 'can' ]);
  inject('pc-store-channels-perms', permissionsModule, 'can', (args, res) => {
    if (args[1] && ([ ...STORE_PLUGINS, ...STORE_THEMES ].includes(args[1].id))) {
      return args[0].data === Permissions.VIEW_CHANNEL.data;
    }
    return res;
  });

  const { transitionTo } = await getModule([ 'transitionTo' ]);
  const ChannelItem = await getModuleByDisplayName('ChannelItem');
  inject('pc-store-channels-props', ChannelItem.prototype, 'render', function (_, res) {
    const data = {};

    STORE_PLUGINS.forEach(id => {
      data[id] = {
        icon: PluginIcon,
        name: Messages.REPLUGGED_PLUGINS,
        route: '/_powercord/store/plugins/'
      };
    });

    STORE_THEMES.forEach(id => {
      data[id] = {
        icon: Theme,
        name: Messages.REPLUGGED_THEMES,
        route: '/_powercord/store/themes/'
      };
    });

    if ([ ...STORE_PLUGINS, ...STORE_THEMES ].includes(this.props.channel.id)) {
      res.props.children[1].props.children[0].props.children[1].props.children = data[this.props.channel.id].name;
      res.props.children[1].props.children[0].props.children[0] = React.createElement(data[this.props.channel.id].icon, {
        className: res.props.children[1].props.children[0].props.children[0].props.className,
        width: 24,
        height: 24
      });
      res.props.children[1].props.children[0].props.onClick = () => {
        transitionTo(data[this.props.channel.id].route);
        FluxDispatcher.dispatch({
          type: 'CHANNEL_SELECT',
          guildId: null
        });
      };
      delete res.props.children[1].props.children[0].props.onFocus;
      delete res.props.onMouseDown;
      delete res.props.onContextMenu;
    }
    return res;
  });

  const { containerDefault } = await getModule([ 'containerDefault' ]);
  forceUpdateElement(`.${containerDefault}`, true);
}

function _init () {
  injectChannels();

  powercord.api.router.registerRoute({
    path: '/store',
    render: Store,
    sidebar: Sidebar
  });
}

function _shut () {
  powercord.api.router.unregisterRoute('/store');
  uninject('pc-store-channels-perms');
  uninject('pc-store-channels-props');

  const classes = getModule([ 'containerDefault' ], false);
  if (classes) {
    forceUpdateElement(`.${classes.containerDefault}`, true);
  }
}

module.exports = function () {
  const styleId = loadStyle(join(__dirname, 'style/style.scss'));
  powercord.api.labs.registerExperiment({
    id: 'pc-moduleManager-store',
    name: 'Powercord Store',
    date: 1571961600000,
    description: 'Powercord Plugin and Theme store',
    callback: (enabled) => enabled ? _init() : _shut()
  });

  if (powercord.api.labs.isExperimentEnabled('pc-moduleManager-store')) {
    _init();
  }

  return () => {
    unloadStyle(styleId);
    powercord.api.labs.unregisterExperiment('pc-moduleManager-store');
    _shut();
  };
};
