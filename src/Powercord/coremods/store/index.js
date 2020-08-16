/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { inject, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName, FluxDispatcher, constants: { Permissions }, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { Plugin: PluginIcon, Theme } } = require('powercord/components');
const { MAGIC_CHANNELS: { STORE_PLUGINS, STORE_THEMES } } = require('powercord/constants');
const { waitFor, getOwnerInstance, forceUpdateElement } = require('powercord/util');

const Sidebar = require('./components/Sidebar');
const Store = require('./components/Store');

async function injectChannels () {
  const permissionsModule = await getModule([ 'can' ]);
  inject('pc-store-channels-perms', permissionsModule, 'can', (args, res) => {
    if (args[1].id === STORE_PLUGINS || args[1].id === STORE_THEMES) {
      return args[0].data === Permissions.VIEW_CHANNEL.data;
    }
    return res;
  });

  const { transitionTo } = await getModule([ 'transitionTo' ]);
  const ChannelItem = await getModuleByDisplayName('ChannelItem');
  inject('pc-store-channels-props', ChannelItem.prototype, 'render', function (_, res) {
    const data = {
      [STORE_PLUGINS]: {
        icon: PluginIcon,
        name: Messages.POWERCORD_PLUGINS,
        route: '/_powercord/store/plugins'
      },
      [STORE_THEMES]: {
        icon: Theme,
        name: Messages.POWERCORD_THEMES,
        route: '/_powercord/store/themes'
      }
    };

    if (this.props.channel.id === STORE_PLUGINS || this.props.channel.id === STORE_THEMES) {
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

async function injectSidebar () {
  const { panels } = await getModule([ 'panels' ]);
  const instance = getOwnerInstance(await waitFor(`.${panels}`));
  inject('pc-store-sidebar', instance._reactInternalFiber.type.prototype, 'render', (_, res) => {
    const renderer = res.props.children;
    res.props.children = (props) => {
      const rendered = renderer(props);
      const className = rendered && rendered.props && rendered.props.children && rendered.props.children.props && rendered.props.children.props.className;
      if (className && className.startsWith('sidebar-') && rendered.props.value.location.pathname.startsWith('/_powercord/store/')) {
        rendered.props.children.props.children[0] = React.createElement(Sidebar);
      }
      return rendered;
    };
    return res;
  });
}

function _init () {
  injectChannels();
  injectSidebar();

  powercord.api.router.registerRoute({
    path: '/store',
    render: Store
  });
}

function _shut () {
  powercord.api.router.unregisterRoute('/store/plugins');
  uninject('pc-store-channels-perms');
  uninject('pc-store-channels-props');
  uninject('pc-store-sidebar');

  const classes = getModule([ 'containerDefault' ], false);
  if (classes) {
    forceUpdateElement(`.${classes.containerDefault}`, true);
  }
}

module.exports = function () {
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
    powercord.api.labs.unregisterExperiment('pc-moduleManager-store');
    _shut();
  };
};
