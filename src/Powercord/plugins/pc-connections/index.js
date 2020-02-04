const { Plugin } = require('powercord/entities');
const { React, getModule, modal } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { getOwnerInstance, waitFor } = require('powercord/util');

const SettingsConnection = require('./components/SettingsConnection');
const ProfileConnection = require('./components/ProfileConnection');

module.exports = class Connections extends Plugin {
  async startPlugin () {
    if (!powercord.account) {
      await powercord.fetchAccount();
    }

    this.classes = {
      ...await getModule([ 'headerInfo' ]),
      ...await getModule([ 'modal', 'inner' ])
    };

    Object.keys(this.classes).forEach(
      key => this.classes[key] = `.${this.classes[key].split(' ')[0]}`
    );

    this.patchSettingsConnections();
    this.patchUserConnections();

    powercord.api.connections.registerConnection({
      type: 'github',
      name: 'GitHub',
      color: '#1b1f23',
      icon: {
        color: 'https://powercord.dev/assets/github_color.png',
        white: 'https://powercord.dev/assets/github_white.png'
      },
      enabled: powercord.account && powercord.account.github,
      account: {
        id: powercord.account.github,
        name: powercord.account.github,
        verified: true,
        visibility: 1
      },
      getPlatformUserUrl: (username) => `https://github.com/${encodeURIComponent(username)}`
    });
  }

  pluginWillUnload () {
    uninject('pc-connections-settings');
    uninject('pc-connections-profile');
  }

  async patchSettingsConnections () {
    const UserSettingsConnections = await getModule(m => m.default && m.default.displayName === 'UserSettingsConnections');
    inject('pc-connections-settings', UserSettingsConnections, 'default', (args, res) => {
      if (!res.props.children) {
        return res;
      }

      const connectedAccounts = res.props.children[2].props.children;
      connectedAccounts.push(...powercord.api.connections.filter(c => c.enabled).map(c =>
        React.createElement(SettingsConnection, {
          account: {
            ...c.account,
            type: c.type
          },
          onDisconnect: () => ((this.log([ connectedAccounts ]), modal.pop()))
        })
      ));

      UserSettingsConnections.default.displayName = 'UserSettingsConnections';

      return res;
    });
  }

  async patchUserConnections () {
    const { classes } = this;
    const instance = getOwnerInstance((await waitFor([
      classes.modal, classes.connectedAccounts
    ].join(' '))).parentElement);

    const UserInfoProfileSection = instance._reactInternalFiber.return.type;
    inject('pc-connections-profile', UserInfoProfileSection.prototype, 'renderConnectedAccounts', function (_, res) {
      if (typeof res === 'object') {
        const { children: connectedAccounts } = res.props.children.props;
        connectedAccounts.push(...powercord.api.connections.filter(c => c.enabled).map(c =>
          React.createElement(ProfileConnection, Object.assign({}, c, c.type !== 'github'
            ? { ...c.account }
            : {
              id: this.props.user.id,
              verified: c.account.verified
            }
          ))
        ));
      }

      return res;
    });

    instance._reactInternalFiber.return.stateNode.forceUpdate();
  }
};
