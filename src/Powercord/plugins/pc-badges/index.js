const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { Tooltip } = require('powercord/components');
const { GUILD_ID, WEBSITE } = require('powercord/constants');
const { React, getModuleByDisplayName } = require('powercord/webpack');
const { inject, injectRecursive, uninject } = require('powercord/injector');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');

const BadgesComponent = require('./Badges.jsx');

module.exports = class Badges extends Plugin {
  startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuildHeaders();
    this._patchUserComponent();
  }

  pluginWillUnload () {
    uninject('pc-badges-users');
    uninject('pc-badges-guilds-header');

    // forceUpdateElement('.pc-channels .pc-hasDropdown');
  }

  async _patchGuildHeaders () {
    const _this = this;
    const GuildHeader = await getModuleByDisplayName('GuildHeader');
    inject('pc-badges-guilds-header', GuildHeader.prototype, 'render', function (_, res) {
      if (this.props.guild.id === GUILD_ID) {
        res.props.children.props.children[0].props.children.props.children.unshift(_this._renderBadge());
      }
      return res;
    });
  }

  async _patchUserComponent () {
    const instance = getOwnerInstance((await waitFor('.pc-modal .pc-headerInfo .pc-nameTag')).parentElement);
    const UserProfileBody = instance._reactInternalFiber.return.type;
    inject('pc-badges-users', UserProfileBody.prototype, 'renderBadges', function (_, res) {
      const badges = React.createElement(BadgesComponent, {
        key: 'powercord',
        id: this.props.user.id
      });

      if (!res) {
        return React.createElement('div', { className: 'powercord-badges' }, badges);
      }

      res.props.children.push(badges);
      return res;
    });
    instance.forceUpdate();
  }

  _renderBadge () {
    return React.createElement(Tooltip, {
      text: 'Official',
      position: 'bottom'
    }, React.createElement('img', {
      className: 'powercord-guild-badge',
      src: `${WEBSITE}/assets/logo.svg`
    }));
  }
};
