const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  /*
   * @todo: Fix this
   * Apparently Discord changed the structure a while ago and nobody really noticed
   * Injecting into this seems more painful than before but eh
   */
  return () => void 0;

  /* eslint-disable no-unreachable */
  const folderClasses = await getModule([ 'wrapper', 'folder' ]);
  const instance = getOwnerInstance(await waitFor(`.${folderClasses.wrapper.split(' ')[0]}`));
  inject('pc-utilitycls-folders', instance.__proto__, 'render', function (args, res) {
    const { audio, badge: mentions, selected, expanded, unread, video } = this.props;

    const conditionals = {
      unread,
      selected,
      expanded,
      audio,
      video,
      mentioned: mentions > 0
    };

    Object.keys(conditionals).forEach(key => {
      if (conditionals[key]) {
        res.props.className += ` ${key}`;
      }
    });

    res.props['data-folder-name'] = this.props.folderName;
    return res;
  });

  setImmediate(() => forceUpdateElement(`.${folderClasses.wrapper.split(' ')[0]}`, true));
  return () => uninject('pc-utilitycls-folders');
};
