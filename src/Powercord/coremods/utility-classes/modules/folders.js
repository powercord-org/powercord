/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const GuildFolder = await getModule(m => m.default && (
    (m.default.type?.render?.toString().includes('defaultFolderName')) ||
    (m.default.type?.__powercordOriginal_render?.toString().includes('defaultFolderName'))
  ), false);

  inject('pc-utilitycls-folders', GuildFolder.default.type, 'render', (args, res) => {
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
