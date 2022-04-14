/**
 * Copyright (c) 2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { spawnSync } = require('child_process');
const { existsSync } = require('fs');
const { BasicMessages, AnsiEscapes } = require('./log');
const { delimiter } = require('path');

function hasInPath(exe) {
  return (process.env.PATH || '')
    .replace(/["]+/g, "")
    .split(delimiter)
    .find(p => existsSync(p + '/' + exe)) ? true : false
}

// It seems `sudo npm ...` no longer give the script sudo perms in npm v7, so here we are.
if (process.platform === 'linux' && process.getuid() !== 0) {
  process.argv.push('--sudo'); // to avoid infinite recursion
  if (hasInPath('sudo')) {
    spawnSync('sudo', process.argv, { stdio: 'inherit' });
  } else if (hasInPath('doas')) {
    spawnSync('doas', process.argv, { stdio: 'inherit' });
  } else {
    console.log('');
    console.log(BasicMessages.PLUG_FAILED);
    console.log('Failed to run \'sudo\' or \'doas\' to elevate script permissions!');
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
  process.exit(0);
}
