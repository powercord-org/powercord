const { React, getModule, contextMenu } = require('powercord/webpack');
const { PopoutWindow, Tooltip, ContextMenu, Icons: { CodeBraces } } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { Plugin } = require('powercord/entities');
const SdkWindow = require('./components/SdkWindow');

module.exports = class SDK extends Plugin {
  async startPlugin () {
    // return; // shhhh

    /* eslint-disable */
    powercord.api.labs.registerExperiment({
      id: 'pc-sdk',
      name: 'Sandbox Development Kit',
      date: 1591011180411,
      description: 'Replugged\'s sandbox development kit for plugin and theme developers',
    });
    this.loadStylesheet('scss/style.scss');
    this._addPopoutIcon();
  }

  pluginWillUnload () {
    // return; // shhhh

    /* eslint-disable */
    uninject('pc-sdk-icon');
    powercord.api.labs.unregisterExperiment('pc-sdk');
  }

  async _addPopoutIcon () {
    const classes = await getModule([ 'iconWrapper', 'clickable' ]);
    const HeaderBarContainer = await getModule(m=> m?.default?.displayName === 'HeaderBar');
    inject('pc-sdk-icon', HeaderBarContainer, 'default', (args, res) => {
      if (powercord.api.labs.isExperimentEnabled('pc-sdk')) {
        const Switcher = React.createElement(Tooltip, {
          text: 'SDK',
          position: 'bottom'
        }, React.createElement('div', {
          className: [ classes.iconWrapper, classes.clickable ].join(' ')
        }, React.createElement(CodeBraces, {
          className: classes.icon,
          onClick: () => this._openSdk(),
          onContextMenu: (e) => {
            contextMenu.openContextMenu(e, () =>
              React.createElement(ContextMenu, {
                width: '50px',
                itemGroups: [ [
                  {
                    type: 'button',
                    name: 'Open Replugged SDK',
                    onClick: () => this._openSdk()
                  },
                  {
                    type: 'button',
                    name: 'Open QuickCSS pop-out',
                    onClick: () => powercord.pluginManager.get('pc-moduleManager')._openQuickCSSPopout()
                  }
                ], [
                  {
                    type: 'button',
                    color: 'colorDanger',
                    name: 'Completely restart Discord',
                    onClick: () => DiscordNative.app.relaunch()
                  }
                ] ]
              })
            );
          }
        })));

        res.props.children.props.children[1].props.children.props.children[0].unshift(Switcher);
      }
      return res;
    });

    const { title } = getModule([ 'title', 'chatContent' ], false);
    getOwnerInstance(await waitFor(`.${title}`)).forceUpdate();
  }

  async _openSdk () {
    const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
    popoutModule.open('DISCORD_POWERCORD_SANDBOX', (key) =>
      React.createElement(PopoutWindow, {
        windowKey: key,
        title: 'SDK'
      }, React.createElement(SdkWindow))
    );
  }
};
