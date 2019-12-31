const { findInReactTree, forceUpdateElement } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const Avatar = await getModule([ 'AnimatedAvatar' ]);
  inject('pc-utilitycls-avatar', Avatar, 'default', (_, res) => {
    const wrapper = findInReactTree(res, n => n.className && n.className.startsWith('wrapper-'));
    const avatar = findInReactTree(wrapper, n => n.src);
    if (avatar && avatar.src) {
      [ , , , , wrapper['data-user-id'] ] = avatar.src.split('/');
    }

    return res;
  });

  inject('pc-utilitycls-animatedAvatar', Avatar.AnimatedAvatar, 'type', (_, res) => {
    if (res.props.src) {
      res.props['aria-label'] += `, ${res.props.src.split('/')[4]}`;
    }

    return res;
  });

  Avatar.default.Sizes = Avatar.Sizes;

  const className = (await getModule([ 'wrapper', 'avatar' ])).wrapper.split(' ')[0];
  setImmediate(() => forceUpdateElement(`.${className}`));
  return async () => {
    uninject('pc-utilitycls-avatar');
    uninject('pc-utilitycls-animatedAvatar');
  };
};
