const { resolve } = require('path');
const { Plugin } = require('powercord/entities');
const { GUILD_ID, WEBSITE } = require('powercord/constants');
const { Tooltip } = require('powercord/components');
const { inject, injectRecursive, uninject } = require('powercord/injector');
const { React, getModuleByDisplayName } = require('powercord/webpack');

const BadgesComponent = require('./Badges.jsx');

module.exports = class Badges extends Plugin {
  startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuildHeaders();
    this._patchUserComponent();
  }

  pluginWillUnload () {
    this.unloadCSS();
    uninject('pc-badges-users');
    uninject('pc-badges-guilds-header');
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
    const UserProfile = await getModuleByDisplayName('UserProfile');

    injectRecursive('pc-badges-users', UserProfile, [
      'prototype',
      'type',
      'type.prototype',
      'type',
      'type.prototype',
      'type.prototype'
    ], function (_, res) {
      const { children } = res.props.children.props.children[0].props.children[0].props.children[1].props;
      const badges = React.createElement(BadgesComponent, {
        key: 'powercord',
        id: this.props.user.id
      });

      if (!children[1]) {
        return (children[1] = React.createElement('div', { className: 'powercord-badges' }, badges));
      }

      children[1].props.children.push(badges);
      return res;
    });
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
