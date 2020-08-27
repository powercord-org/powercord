/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { forceUpdateElement } = require('powercord/util');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const Avatar = await getModule([ 'AnimatedAvatar' ]);
  inject('pc-utilitycls-avatar', Avatar, 'default', (args, res) => {
    const avatar = args[0].src || void 0;
    if (avatar && avatar.includes('/avatars')) {
      [ , res.props['data-user-id'] ] = avatar.match(/\/avatars\/(\d+)/);
    }

    return res;
  });

  // Re-render using patched component
  inject('pc-utilitycls-animatedAvatar', Avatar.AnimatedAvatar, 'type', (_, res) =>
    React.createElement(Avatar.default, { ...res.props }));

  Avatar.default.Sizes = Avatar.Sizes;

  const className = (await getModule([ 'wrapper', 'avatar' ])).wrapper.split(' ')[0];
  setImmediate(() => forceUpdateElement(`.${className}`));
  return () => {
    uninject('pc-utilitycls-avatar');
    uninject('pc-utilitycls-animatedAvatar');
  };
};
