const { resolve } = require('path');
const { get } = require('powercord/http');
const { Plugin } = require('powercord/entities');
const { WEBSITE } = require('powercord/constants');
const { Tooltip } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { React, getModule } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');

const BadgesComponent = require('./Badges.jsx');

module.exports = class Badges extends Plugin {
  constructor () {
    super();
    this.guildBadges = {};
  }

  startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuildHeaders();
    this._patchUserComponent();
    this._fetchBadges();
  }

  pluginWillUnload () {
    uninject('pc-badges-users');
    uninject('pc-badges-guilds-header');

    if (document.querySelector('.pc-channels .pc-hasDropdown')) {
      forceUpdateElement('.pc-channels .pc-hasDropdown');
    }
  }

  async _patchGuildHeaders () {
    const _this = this;
    const classes = await getModule([ 'iconBackgroundTierNone', 'container' ]);
    const guildHeader = await waitFor(`.${classes.container.replace(/ /g, '.')}`);
    const instance = getOwnerInstance(guildHeader);
    inject('pc-badges-guilds-header', instance.__proto__, 'render', function (_, res) {
      if (_this.guildBadges[this.props.guild.id]) {
        res.props.children.props.children[0].props.children.props.children.unshift(
          _this._renderBadge(
            _this.guildBadges[this.props.guild.id]
          )
        );
      }
      return res;
    });
  }

  async _patchUserComponent () {
    // @todo: Don't use .pc-
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

  async _fetchBadges () {
    try {
      const baseUrl = powercord.settings.get('backendURL', WEBSITE);
      this.guildBadges = await get(`${baseUrl}/api/badges`).then(res => res.body);

      // @todo: Don't use .pc-
      if (document.querySelector('.pc-channels .pc-hasDropdown')) {
        forceUpdateElement('.pc-channels .pc-hasDropdown');
      }
    } catch (e) {
      // Let it fail silently
    }
  }

  _renderBadge ({ name, icon }) {
    return React.createElement(Tooltip, {
      text: name,
      position: 'bottom'
    }, React.createElement('img', {
      className: 'powercord-guild-badge',
      src: icon
    }));
  }
};
