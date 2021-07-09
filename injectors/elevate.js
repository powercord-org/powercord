/**
 * Copyright (c) 2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { spawnSync } = require('child_process');

// It seems `sudo npm ...` no longer give the script sudo perms in npm v7, so here we are.
if (process.platform === 'linux' && process.getuid() !== 0) {
  // todo: decide whether this is a viable solution for the long term. people may use doas or other tools for elevating themselves.
  spawnSync('sudo', process.argv, { stdio: 'inherit' })
  process.exit(0)
}
