/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const modules = [
  require('./modules/generic'),
  require('./modules/avatars'),
  require('./modules/folders'),
  require('./modules/guildHeader'),
  require('./modules/guilds'),
  require('./modules/messages'),
  require('./modules/tabBar')
];

module.exports = function () {
  const callbacks = [];
  modules.forEach(async mod => {
    try {
      const callback = await mod();
      if (typeof callback === 'function') {
        callbacks.push(callback);
      }
    } catch (e) {
      console.error('An error occured while initializing coremods', e);
    }
  });

  return () => Promise.all(callbacks.map(cb => cb()));
};
