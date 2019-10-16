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

const { resolve } = require('path');
const { execSync } = require('child_process');

module.exports = () => {
  // Don't clone in System32
  if (__dirname.toLowerCase().replace(/\\/g, '/').includes('/windows/system32/')) {
    console.error('Powercord shouldn\'t be cloned in System32, as this will generate conflicts and bloat your Windows installation. Please remove it and clone it in another place.\n' +
      'Note: Not opening cmd as administrator will be enough.');
    process.exit(1);
  }

  // Verify if we're on node 10.x
  const fs = require('fs');
  if (!fs.promises) {
    console.error('You\'re on an outdated Node.js version. Powercord requires you to run at least Node 10. You can download it here: https://nodejs.org');
    process.exit(1);
  }

  // Verify if deps have been installed. If not, install them automatically
  const { dependencies } = require('../package.json');

  try {
    for (const dependency in dependencies) {
      require(dependency);
    }
  } catch (_) {
    const stackTrace = JSON.stringify(_.stack);
    const firstMissingDept = stackTrace.split('\\n')[0].match(/'(.*?[^\\])'/)[1];
    const dependenciesArray = Object.keys(dependencies);

    console.log(`(${dependenciesArray.length - dependenciesArray.indexOf(firstMissingDept)}/${dependenciesArray.length}) Dependencies are not installed. Let's fix that...`);
    execSync('npm install --only=prod', {
      cwd: resolve(__dirname, '..'),
      stdio: [ null, null, null ]
    });
  }
};
