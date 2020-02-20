const { Plugin } = require('powercord/entities');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');
const { get, del } = require('powercord/http');
const { resolve } = require('path');

const SettingsConnections = require('./components/settings/ConnectedAccounts');
const ProfileConnections = require('./components/profile/ConnectedAccounts');
const Connection = require('./components/ConnectAccountButton');

module.exports = class Connections extends Plugin {
  constructor () {
    super();

    this.baseUrl = powercord.settings.get('backendURL', WEBSITE);
  }

    this.loadCSS(resolve(__dirname, 'style.css'));
  async startPlugin () {
    this.classes = {
      ...await getModule([ 'headerInfo' ]),
      ...await getModule([ 'modal', 'inner' ]),
      ...await getModule([ 'connection', 'integration' ])
    };

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
      enabled: true,
      fetchAccount: async (id) => {
        let accounts = [];
        if (!id) {
          if (powercord.account) {
            accounts = await get(`${this.baseUrl}/api/v2/users/@me/accounts`)
              .set('Authorization', powercord.account.token)
              .then(r => r.body);
          }
        } else {
          accounts = await get(`${this.baseUrl}/api/v2/users/${id}/accounts`)
            .then(r => r.body);
        }

        return accounts.find(account => account.type === 'github');
      },
      getPlatformUserUrl: (account) => {
        const username = account.id;
        return `https://github.com/${encodeURIComponent(username)}`;
      },
      onDisconnect: async (account) => del(`${this.baseUrl}/api/v2/users/@me/accounts/${account.type}`)
        .set('Authorization', powercord.account.token)
    });
  }

  pluginWillUnload () {
    powercord.api.connections.unregisterConnection('github');
    uninject('pc-connections-settings');
    uninject('pc-connections-profile');
  }

  async patchSettingsConnections () {
    const UserSettingsConnections = await getModule(m => m.default && m.default.displayName === 'UserSettingsConnections');
    inject('pc-connections-settings', UserSettingsConnections, 'default', (args, res) => {
      if (!res.props.children) {
        return res;
      }

      const availableConnections = res.props.children[0].props.children[2].props.children;
      availableConnections.push(React.createElement(Connection, {
        className: this.classes.accountBtn,
        innerClassName: this.classes.accountBtnInner,
        disabled: !powercord.account,
        type: 'github'
      }));

      const connectedAccounts = res.props.children[2].props.children;
      connectedAccounts.push(React.createElement(SettingsConnections, {}));

      UserSettingsConnections.default.displayName = 'UserSettingsConnections';
      return res;
    });
  }

  async patchUserConnections () {
    const _this = this;
    const UserInfoProfileSection = await this._fetchUserConnectionModule();
    // @todo: remove empty line when there aren't connections
    inject('pc-connections-profile', UserInfoProfileSection.prototype, 'renderConnectedAccounts', function (_, res) {
      if (typeof res === 'object') {
        const { children: connectedAccounts } = res.props.children.props;
        connectedAccounts.push(React.createElement(ProfileConnections, {
          id: this.props.user.id
        }));
      } else {
        return React.createElement('div', { className: _this.classes.userInfoSection },
          React.createElement('div', { className: _this.classes.connectedAccounts }, React.createElement(ProfileConnections, {
            id: this.props.user.id
          }))
        );
      }

      return res;
    });
  }

  async _fetchUserConnectionModule () {
    // BEAUTIFUL, ABSOLUTELY BEAUTIFUL I LOVE INJECTING INTO DISCORD.
    const UserProfile = await getModuleByDisplayName('UserProfile');
    const setp1 = React.createElement(UserProfile)
      .type.prototype.render()
      .type.prototype.render.call({ memoizedGetStateFromStores: () => ({}) })
      .type.render()
      .type.prototype.render.call({ props: {} }).type;
    return setp1.prototype.render.call({
      ...setp1.prototype,
      props: {
        user: {
          getAvatarURL: () => void 0,
          hasFlag: () => void 0
        }
      },
      state: {}
    }).props.children.props.children[1].props.children
      .type.prototype.render.call({ memoizedGetStateFromStores: () => ({}) }).type;
  }
};
