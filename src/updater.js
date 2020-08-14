/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { join } = require('path');
const { inject } = require('../injectors/main');
const win32 = require('../injectors/win32');

if (process.platform === 'win32') {
  console.log('[Powercord] Detected a Windows installation. Injecting into the updater');
  const squirrelUpdateScript = join(process.execPath, '..', 'resources/app.asar', 'app_bootstrap/squirrelUpdate.js');

  const { restart: squirrelRestart } = require(squirrelUpdateScript);
  require.cache[squirrelUpdateScript].exports.restart = function (app, newVersion) {
    console.log('[Powercord] Injecting in the new version');
    inject(win32).then(() => squirrelRestart(app, newVersion));
  };
}
