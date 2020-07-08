const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const GuildFolder = await getModule(m => m.default && m.default.type && m.default.type.toString().includes('defaultFolderName'), false);
  inject('pc-utilitycls-folders', GuildFolder.default, 'type', (args, res) => {
    const { audio, badge: mentions, selected, expanded, unread, video, folderName } = args[0];

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

    res.props['data-folder-name'] = folderName;
    return res;
  });

  return () => uninject('pc-utilitycls-folders');
};
