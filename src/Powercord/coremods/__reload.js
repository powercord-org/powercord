/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

module.exports = function () {
  require('.').unload();
  Object.keys(require.cache).forEach(key => {
    if (key.includes('src/Powercord/coremods')) {
      delete require.cache[key];
    }
  });
  require('.').load();
};
