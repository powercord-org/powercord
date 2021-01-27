/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const modules = [
  require('./modules/generic'),
  require('./modules/avatars'),
  require('./modules/folders'),
  require('./modules/guildHeader'),
  // todo: this causes a hard crash on boot -- require('./modules/guilds'),
  require('./modules/messages'),
  require('./modules/tabBar')
];

module.exports = function () {
  const callbacks = [];
  modules.forEach(async mod => {
    const callback = await mod();
    if (typeof callback === 'function') {
      callbacks.push(callback);
    }
  });

  return () => Promise.all(callbacks.map(cb => cb()));
};
