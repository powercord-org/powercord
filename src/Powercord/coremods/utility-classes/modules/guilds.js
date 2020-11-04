/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  return () => void 0;
  /* eslint-disable */
  const guildClasses = await getModule([ 'blobContainer' ]);
  const guildElement = (await waitFor(`.${guildClasses.blobContainer.split(' ')[0]}`)).parentElement;
  const instance = getOwnerInstance(guildElement);
  inject('pc-utilitycls-guilds', instance.__proto__, 'render', function (args, res) {
    const { audio, badge: mentions, selected, unread, video } = this.props;

    const conditionals = {
      unread,
      selected,
      audio,
      video,
      mentioned: mentions > 0
    };

    Object.keys(conditionals).forEach(key => {
      if (conditionals[key]) {
        res.props.className += ` ${key}`;
      }
    });

    res.props['data-guild-name'] = this.props.guild.name;
    res.props['data-guild-id'] = this.props.guildId;
    return res;
  });

  setImmediate(() => forceUpdateElement(`.${guildElement.className.split(' ')[0]}`, true));
  return () => uninject('pc-utilitycls-guilds');
};
