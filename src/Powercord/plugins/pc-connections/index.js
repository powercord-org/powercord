const { Plugin } = require('powercord/entities');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');

const SettingsConnections = require('./components/settings/ConnectedAccounts');
const ProfileConnections = require('./components/profile/ConnectedAccounts');

module.exports = class Connections extends Plugin {
  constructor () {
    super();

    this.baseUrl = powercord.settings.get('backendURL', WEBSITE);
  }

  async startPlugin () {
    this.classes = {
      ...await getModule([ 'headerInfo', 'nameTag' ]),
      ...await getModule([ 'modal', 'inner' ]),
      ...await getModule([ 'connection', 'integration' ])
    };

    this.patchSettingsConnections();
    this.patchUserConnections();
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
      connectedAccounts.push(React.createElement(SettingsConnections, {}));
      return res;
    });

    UserSettingsConnections.default.displayName = 'UserSettingsConnections';
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
    // noinspection JSPotentiallyInvalidConstructorUsage
    const setp1 = React.createElement(UserProfile)
      .type.prototype.render()
      .type.prototype.render.call({ memoizedGetStateFromStores: () => ({}) })
      .type.render()
      .type.prototype.render.call({ props: {} }).type;
    // noinspection JSPotentiallyInvalidConstructorUsage
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
