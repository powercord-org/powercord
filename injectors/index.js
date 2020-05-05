/**
 * Powercord, a lightweight @discord client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
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

// Perform checks
require('./env_check')();

// And then do stuff
require('../polyfills');

const { writeFile } = require('fs').promises;
const { resolve } = require('path');
const main = require('./main.js');

let platformModule;
try {
  platformModule = require(`./${process.platform}.js`);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(`Unsupported platform "${process.platform}"`);
    process.exit(1);
  }
}

(async () => {
  if (process.argv[2] === 'inject') {
    if (await main.inject(platformModule)) {
      // To show up popup message
      await writeFile(
        resolve(__dirname, '..', 'src', '__injected.txt'),
        'hey cutie'
      );

      console.log('Successfully plugged Powercord!');
    }
  } else if (process.argv[2] === 'uninject') {
    if (await main.uninject(platformModule)) {
      console.log('Successfully unplugged Powercord!');
    }
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting..`);
    process.exit(1);
  }
})().catch(e => console.error('fucky wucky', e));
