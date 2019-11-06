const { resolve } = require('path');
const { get } = require('powercord/http');
const { Plugin } = require('powercord/entities');
const { WEBSITE } = require('powercord/constants');
const { Tooltip } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getModuleByDisplayName, getAllModules } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');

const BadgesComponent = require('./Badges.jsx');

module.exports = class Badges extends Plugin {
  constructor () {
    super();
    this.guildBadges = {};
  }

  async startPlugin () {
    this.badgeClasses = {
      container: (await getModule([ 'iconBackgroundTierNone', 'container' ])).container,
      ...await getAllModules([ 'modal', 'inner' ])[1],
      ...await getModule([ 'headerInfo' ])
    };

    Object.keys(this.badgeClasses).forEach(
      key => this.badgeClasses[key] = `.${this.badgeClasses[key].split(' ')[0]}`
    );

    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuildHeaders();
    this._patchUserComponent();
    this._fetchBadges();
  }

  pluginWillUnload () {
    uninject('pc-badges-users');
    uninject('pc-badges-guilds-header');

    if (document.querySelector(this.badgeClasses.container)) {
      forceUpdateElement(this.badgeClasses.container);
    }
  }

  async _patchGuildHeaders () {
    const _this = this;
    const GuildHeader = await getModuleByDisplayName('GuildHeader');
    inject('pc-badges-guilds-header', GuildHeader.prototype, 'renderHeader', function (_, res) {
      if (_this.guildBadges[this.props.guild.id]) {
        res.props.children.unshift(
          _this._renderBadge(
            _this.guildBadges[this.props.guild.id]
          )
        );
      }
      return res;
    });
  }

  async _patchUserComponent () {
    const { badgeClasses } = this;
    const instance = getOwnerInstance((await waitFor([
      badgeClasses.modal, badgeClasses.headerInfo, badgeClasses.nameTag
    ].join(' '))).parentElement);

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

      if (document.querySelector(this.badgeClasses.container)) {
        forceUpdateElement(this.badgeClasses.container);
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
