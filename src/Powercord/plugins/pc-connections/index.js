const { Plugin } = require('powercord/entities');
const { React, getModule, getModuleByDisplayName, modal } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

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
        // @todo: Update if the account is updated
        id: powercord.account && powercord.account.github,
        name: powercord.account && powercord.account.github,
        verified: true,
        visibility: 1
      },
      getPlatformUserUrl: (username) => `https://github.com/${encodeURIComponent(username)}`
    });
  }

  pluginWillUnload () {
    powercord.api.connections.unregisterConnection('github');
    uninject('pc-connections-settings');
    uninject('pc-connections-profile');
  }

  async patchSettingsConnections () {
    // Breaks on my end (can't find component even tho it should thanks discord) - do we really need to do this (dupe data w/ general settings tab)
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
          onDisconnect: () => {
            this.log([ connectedAccounts ]);
            modal.pop();
          }
        })
      ));

      UserSettingsConnections.default.displayName = 'UserSettingsConnections';
      return res;
    });
  }

  async patchUserConnections () {
    const _this = this;
    const UserInfoProfileSection = await this._fetchUserConnectionModule();
    /*
     * @todo: remove empty line when there aren't connections
     * We should reconsider the logic used here, and self shouldn't be treated differently (useless complexity)
     * Maybe use a similar method as Discord's for fetching connections (and to fetch badges in Powercord) and always
     * poll (even for self). That'd require a new API endpoint though, but that's already the case given that
     * connections now require a "hidden" field.
     */
    inject('pc-connections-profile', UserInfoProfileSection.prototype, 'renderConnectedAccounts', function (_, res) {
      // thonk?? display of *others* profile connection depends on self?
      const accounts = powercord.api.connections.filter(c => c.enabled);
      if (accounts.length === 0) {
        return res;
      }

      if (typeof res === 'object') {
        const { children: connectedAccounts } = res.props.children.props;
        connectedAccounts.push(...accounts.map(c =>
          React.createElement(ProfileConnection, Object.assign({}, c, c.type !== 'github'
            ? { ...c.account }
            : {
              id: this.props.user.id,
              verified: c.account.verified
            }
          ))
        ));
      } else {
        return React.createElement('div', { className: _this.classes.userInfoSection },
          React.createElement('div', { className: _this.classes.connectedAccounts }, accounts.map(c =>
            React.createElement(ProfileConnection, Object.assign({}, c, c.type !== 'github'
              ? { ...c.account }
              : {
                id: this.props.user.id,
                verified: c.account.verified
              }
            ))
          ))
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
