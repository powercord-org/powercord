/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { join } = require('path');
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { WEBSITE } = require('powercord/constants');
const { Flex } = require('powercord/components');
const { get } = require('powercord/http');

const { loadStyle, unloadStyle } = require('../util');
const Badges = require('./Badges');

const cache = { _guilds: {} };

async function getUserProfileBody () {
  const UserProfile = await getModuleByDisplayName('UserProfile');
  const VeryVeryDecoratedUserProfileBody = UserProfile.prototype.render().type;
  const VeryDecoratedUserProfileBody = VeryVeryDecoratedUserProfileBody.prototype.render.call({ memoizedGetStateFromStores: () => void 0 }).type;
  const DecoratedUserProfileBody = VeryDecoratedUserProfileBody.render().type;
  return DecoratedUserProfileBody.prototype.render.call({ props: { forwardedRef: null } }).type;
}

function hasBadge (badges) {
  return badges.developer ||
    badges.staff ||
    badges.support ||
    badges.contributor ||
    badges.translator ||
    badges.hunter ||
    badges.early ||
    (badges.custom && badges.custom.name && badges.custom.icon);
}

function fetchBadges () {
  if (cache[this.props.id]) {
    this.setState({ __pcBadges: this.props.user.id });
  }

  const baseUrl = powercord.settings.get('backendURL', WEBSITE);
  get(`${baseUrl}/api/v2/users/${this.props.user.id}`)
    .then(res => this.setState({ __pcBadges: res.body.badges }))
    .catch(() => void 0);
}

async function injectUsers () {
  const UserProfileBody = await getUserProfileBody();
  const { profileBadges } = await getModule([ 'profileBadges' ]);

  inject('pc-badges-users-fetch', UserProfileBody.prototype, 'componentDidMount', fetchBadges);
  inject('pc-badges-users-update', UserProfileBody.prototype, 'componentDidUpdate', function ([ prevProps ]) {
    if (this.props.user.id !== prevProps.user.id) {
      fetchBadges.call(this);
    }
  });

  inject('pc-badges-users-render', UserProfileBody.prototype, 'renderBadges', function (_, res) {
    if (this.state.__pcBadges && hasBadge(this.state.__pcBadges)) {
      if (!res) {
        // There's no container if the user have no flags
        res = React.createElement(Flex, {
          className: profileBadges,
          basis: 'auto',
          grow: 1,
          shrink: 1
        }, []);
      }

      const render = (Component, key, props = {}) => (
        React.createElement(Component, {
          key: `pc-${key}`,
          color: this.state.__pcBadges.custom && this.state.__pcBadges.custom.color,
          ...props
        })
      );

      if (this.state.__pcBadges.custom && this.state.__pcBadges.custom.name && this.state.__pcBadges.custom.icon) {
        res.props.children.push(render(Badges.Custom, 'cutie', this.state.__pcBadges.custom));
      }
      if (this.state.__pcBadges.developer) {
        res.props.children.push(render(Badges.Developer, 'developer'));
      }
      if (this.state.__pcBadges.staff) {
        res.props.children.push(render(Badges.Staff, 'staff'));
      }
      if (this.state.__pcBadges.support) {
        res.props.children.push(render(Badges.Support, 'support'));
      }
      if (this.state.__pcBadges.contributor) {
        res.props.children.push(render(Badges.Contributor, 'contributor'));
      }
      if (this.state.__pcBadges.translator) {
        res.props.children.push(render(Badges.Translator, 'translator'));
      }
      if (this.state.__pcBadges.hunter) {
        res.props.children.push(render(Badges.BugHunter, 'hunter'));
      }
      if (this.state.__pcBadges.early) {
        res.props.children.push(render(Badges.EarlyUser, 'early'));
      }
    }

    return res;
  });
}

async function injectGuilds () {
  const GuildHeader = await getModuleByDisplayName('GuildHeader');
  const GuildBadge = await getModuleByDisplayName('GuildBadge');

  inject('pc-badges-guilds-header', GuildHeader.prototype, 'renderHeader', function (_, res) {
    if (cache._guilds[this.props.guild.id]) {
      res.props.children.unshift(
        React.createElement(Badges.Custom, {
          ...cache._guilds[this.props.guild.id],
          tooltipPosition: 'bottom'
        })
      );
    }
    return res;
  });

  inject('pc-badges-guilds-tooltip', GuildBadge.prototype, 'render', function (_, res) {
    if (this.props.size && cache._guilds[this.props.guild.id]) {
      return [
        React.createElement(Badges.Custom, {
          ...cache._guilds[this.props.guild.id],
          tooltipPosition: 'bottom'
        }),
        res
      ];
    }
    return res;
  });

  const baseUrl = powercord.settings.get('backendURL', WEBSITE);
  get(`${baseUrl}/api/v2/guilds/badges`).then(async res => {
    cache._guilds = res.body;
    const { container } = await getModule([ 'subscribeTooltipText' ]);
    forceUpdateElement(`.${container}`);
  });
}

module.exports = async function () {
  const styleId = loadStyle(join(__dirname, 'style.css'));
  await injectUsers();
  await injectGuilds();

  return function () {
    unloadStyle(styleId);
    uninject('pc-badges-users-render');
    uninject('pc-badges-users-update');
    uninject('pc-badges-users-fetch');
    uninject('pc-badges-guilds-header');
    uninject('pc-badges-guilds-tooltip');

    const containerClasses = getModule([ 'subscribeTooltipText' ], false);
    const modalClasses = getModule([ 'topSectionNormal' ], false);
    if (containerClasses) {
      forceUpdateElement(`.${containerClasses.container}`);
    }
    if (modalClasses) {
      const modalHeader = document.querySelector(`.${modalClasses.topSectionNormal} header`);
      if (modalHeader) {
        getOwnerInstance(modalHeader)._reactInternalFiber.return.stateNode.forceUpdate();
      }
    }
  };
};
