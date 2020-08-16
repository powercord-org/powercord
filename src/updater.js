/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { join } = require('path');
const { inject } = require('../injectors/main');

const applicableEnvs = [ 'win32', 'darwin' ];

if (applicableEnvs.includes(process.platform)) {
  console.log('[Powercord] Detected an installation sensitive to host updates. Injecting into the updater');
  const injector = require(`../injectors/${process.platform}`);
  const squirrelUpdateScript = join(require.main.filename, '../../app.asar', 'app_bootstrap/squirrelUpdate.js');

  const { restart: squirrelRestart } = require(squirrelUpdateScript);
  require.cache[squirrelUpdateScript].exports.restart = function (app, newVersion) {
    console.log('[Powercord] Injecting in the new version');
    inject(injector).then(() => squirrelRestart(app, newVersion));
  };
}
