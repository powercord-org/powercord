const { get } = require('powercord/http');
const { Plugin } = require('powercord/entities');
const { WEBSITE } = require('powercord/constants');
const { open: openModal } = require('powercord/modal');
const { Clickable, Tooltip } = require('powercord/components');
const { inject, uninject } = require('powercord/injector');
const { React, getModule, getAllModules, getModuleByDisplayName } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');

const DonateModal = require('./DonateModal');
const BadgesComponent = require('./Badges');

module.exports = class Badges extends Plugin {
  constructor () {
    super();
    this.guildBadges = {};
  }

  async startPlugin () {
    this.classes = {
      ...await getModule([ 'headerInfo', 'nameTag' ]),
      ...await getAllModules([ 'modal', 'inner' ])[1],
      header: (await getModule([ 'iconBackgroundTierNone', 'container' ])).header
    };

    Object.keys(this.classes).forEach(
      key => this.classes[key] = `.${this.classes[key].split(' ')[0]}`
    );

    this.loadStylesheet('style.scss');
    this._patchGuildTooltips();
    this._patchGuildHeaders();
    this._patchUserComponent();
    this._fetchBadges();
  }

  pluginWillUnload () {
    uninject('pc-badges-users');
    uninject('pc-badges-guilds-header');
    uninject('pc-badges-guilds-tooltip');

    forceUpdateElement(this.classes.header);
  }

  async _patchGuildTooltips () {
    const _this = this;
    const GuildBadge = await getModuleByDisplayName('GuildBadge');
    inject('pc-badges-guilds-tooltip', GuildBadge.prototype, 'render', function (_, res) {
      const { guild } = this.props;
      // GuildBadges is used in different places, size prop seems GuildTooltip "exclusive"
      if (this.props.size && _this.guildBadges[guild.id]) {
        return [ _this._renderBadge(_this.guildBadges[guild.id]), res ];
      }

      return res;
    });
  }

  async _patchGuildHeaders () {
    const _this = this;
    const GuildHeader = await getModuleByDisplayName('GuildHeader');
    inject('pc-badges-guilds-header', GuildHeader.prototype, 'renderHeader', function (_, res) {
      if (_this.guildBadges[this.props.guild.id]) {
        res.props.children.unshift(
          _this._renderBadge(_this.guildBadges[this.props.guild.id])
        );
      }
      return res;
    });
  }

  async _patchUserComponent () {
    const { classes } = this;
    const instance = getOwnerInstance((await waitFor([
      classes.modal, classes.headerInfo, classes.nameTag
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
      this.guildBadges = await get(`${baseUrl}/api/v2/guilds/badges`).then(res => res.body);

      if (document.querySelector(this.classes.header)) {
        forceUpdateElement(this.classes.header);
      }
    } catch (e) {
      // Let it fail silently
    }
  }

  _renderBadge ({ name, icon }) {
    return React.createElement(Tooltip, {
      text: name,
      position: 'bottom'
    }, React.createElement(Clickable, {
      onClick: () => openModal(DonateModal),
      className: 'powercord-guild-badge'
    }, React.createElement('img', {
      src: icon,
      alt: ''
    })));
  }
};
