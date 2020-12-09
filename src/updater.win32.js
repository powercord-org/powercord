/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { join } = require('path');
const { inject } = require('../injectors/main');

if (process.platform === 'win32') { // Should be the only possible case, but we never know
  console.log('[Powercord] Injecting into Squirrel update script');
  const injector = require(`../injectors/${process.platform}`);
  const squirrelUpdateScript = join(require.main.filename, '..', 'squirrelUpdate.js');

  const { restart: squirrelRestart } = require(squirrelUpdateScript);
  require.cache[squirrelUpdateScript].exports.restart = function (app, newVersion) {
    console.log('[Powercord] Injecting in the new version');
    inject(injector).then(() => squirrelRestart(app, newVersion));
  };
}
