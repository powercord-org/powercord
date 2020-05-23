const { findInReactTree, forceUpdateElement } = require('powercord/util');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const Avatar = await getModule([ 'AnimatedAvatar' ]);
  inject('pc-utilitycls-avatar', Avatar, 'default', (_, res) => {
    const avatar = findInReactTree(res, n => n.src);
    if (avatar && avatar.src) {
      [ , , , , res.props['data-user-id'] ] = avatar.src.split('/');
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
