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

const { mkdir, writeFile, unlink, rmdir, access } = require('fs').promises;
const { resolve, join, sep } = require('path');

const exists = (path) =>
  access(path)
    .then(() => true)
    .catch(() => false);

exports.inject = async ({ getAppDir }) => {
  const appDir = await getAppDir();
  if (await exists(appDir)) {
    console.log('Looks like you already have an injector in place. Try uninjecting (`npm run uninject`) and try again.');
    process.exit(1);
  }

  await mkdir(appDir);

  await Promise.all([
    writeFile(
      join(appDir, 'index.js'),
      `require(\`${__dirname.replace(RegExp(sep.repeat(2), 'g'), '/')}/../src/patcher.js\`)`
    ),
    writeFile(
      join(appDir, 'package.json'),
      JSON.stringify({ main: 'index.js' })
    ),
    writeFile(
      resolve(__dirname, '..', 'src', '__injected.txt'),
      'hey cutie'
    )
  ]);
};

exports.uninject = async ({ getAppDir }) => {
  const appDir = await getAppDir();

  if (!(await exists(appDir))) {
    console.log('There is nothing to uninject.');
    process.exit(1);
  }

  await Promise.all([
    unlink(join(appDir, 'package.json')),
    unlink(join(appDir, 'index.js'))
  ]);

  return rmdir(appDir);
};
