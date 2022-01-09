/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const FolderItem = await getModule(m => m.default?.displayName === 'FolderItem', false);

  inject('pc-utilitycls-folders', FolderItem, 'default', (args, res) => {
    const { mentionCount, selected, expanded, unread, folderNode, mediaState } = args[0];

    const conditionals = {
      unread,
      selected,
      expanded,
      audio: mediaState.audio,
      video: mediaState.video,
      mentioned: mentionCount > 0
    };

    Object.keys(conditionals).forEach(key => {
      if (conditionals[key]) {
        res.props.className += ` ${key}`;
      }
    });

    res.props['data-folder-name'] = folderNode.name;
    return res;
  });

  return () => uninject('pc-utilitycls-folders');
};
