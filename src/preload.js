/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

require('../polyfills');

const { remote } = require('electron');
const { join } = require('path');

require('module')
  .Module
  .globalPaths
  .push(
    join(__dirname, 'fake_node_modules')
  );

const isOverlay = (/overlay/).test(location.pathname);

const Powercord = require('./Powercord');
global.powercord = new Powercord();

// https://github.com/electron/electron/issues/9047
if (
  process.platform === 'darwin' &&
  !process.env.PATH.includes('/usr/local/bin')
) {
  process.env.PATH += ':/usr/local/bin';
}

require(remote.getGlobal('originalPreload'));


(async () => {
  const { sleep } = require('powercord/util');

  while (!powercord.initialized) {
    await sleep(1);
  }

  if (powercord.api.settings.store.getSetting('pc-general', 'openOverlayDevTools', false) && isOverlay) {
    setTimeout(() => {
      remote
        .getCurrentWindow()
        .openDevTools({
          mode: 'detach'
        });
    }, 1500);
  }
})();
