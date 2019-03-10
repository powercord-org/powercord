const { resolve } = require('path');
const Plugin = require('powercord/Plugin');
const { GUILD_ID } = require('powercord/constants');
const { Tooltip } = require('powercord/components');
const { inject, injectRecursive, uninject } = require('powercord/injector');
const { React, getModuleByDisplayName } = require('powercord/webpack');

const BadgesComponent = require('./Badges.jsx');

module.exports = class Badges extends Plugin {
  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this._patchGuildHeaders();
    this._patchUserComponent();
  }

  unload () {
    this.unloadCSS();
    uninject('pc-badges-users');
    uninject('pc-badges-guilds-header');
  }

  async _patchGuildHeaders () {
    const _this = this;
    const GuildHeader = await getModuleByDisplayName('GuildHeader');
    inject('pc-badges-guilds-header', GuildHeader.prototype, 'render', function (args, res) {
      if (this.props.guild.id === GUILD_ID) {
        res.props.children.props.children.props.children.unshift(_this._renderBadge());
      }
      return res;
    });
  }

  async _patchUserComponent () {
    const UserProfile = await getModuleByDisplayName('UserProfile');

    injectRecursive('pc-badges-users', UserProfile, [
      { path: [ 'prototype' ] },
      { path: [ 'type' ] },
      { path: [ 'type', 'prototype' ] },
      { path: [ 'type' ] },
      { path: [ 'type', 'prototype' ] },
      { path: [ 'type', 'prototype' ] }
    ], function (args, res) {
      const Component = React.createElement(BadgesComponent, {
        key: 'powercord',
        user: this.props.user
      });

      if (!res.props.children.props.children[0].props.children[0].props.children[1].props.children[1]) {
        return res.props.children.props.children[0].props.children[0].props.children[1].props.children[1] = React.createElement('div', { className: 'powercord-badges' }, Component);
      }
      res.props.children.props.children[0].props.children[0].props.children[1].props.children[1].props.children.push(Component);
      return res;
    });
  }

  _renderBadge () {
    return React.createElement(Tooltip, {
      text: 'Official',
      position: 'bottom'
    }, React.createElement('img', {
      className: 'powercord-guild-badge',
      src: 'https://powercord.xyz/assets/logo.svg'
    }));
  }
};
