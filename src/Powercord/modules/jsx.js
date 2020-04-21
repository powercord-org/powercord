/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
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

const sucrase = require('sucrase');
const { join } = require('path');
const { readFileSync, existsSync, mkdirSync, writeFile } = require('fs');
const { createHash } = require('crypto');
const { CACHE_FOLDER } = require('powercord/constants');

const checksum = (str) => createHash('sha1').update(str).digest('hex');

module.exports = () => {
  const cacheDir = join(CACHE_FOLDER, 'jsx');

  const ensureFolder = () => {
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true });
    }
  };

  // noinspection JSDeprecatedSymbols
  require.extensions['.jsx'] = (_module, filename) => {
    const source = readFileSync(filename, 'utf8');
    const hash = checksum(`/* sucrase-jsx (${sucrase.getVersion()}) | ${filename} */ ${source}`);
    const cached = join(cacheDir, `${hash}.js`);

    try {
      _module._compile(readFileSync(cached, 'utf8'), filename);
    } catch (_) {
      const res = sucrase.transform(source, {
        transforms: [ 'jsx' ],
        filePath: filename
      }).code;

      _module._compile(res, filename);

      writeFile(cached, res, (err) => {
        if (err) {
          console.error('%c[Powercord:JSX]', 'color: #7289da', 'Failed to write to cache');
          console.error(err);
        }
      });
    }
  };

  // noinspection JSDeprecatedSymbols
  require.extensions['.jsx'].ensureFolder = ensureFolder;
  ensureFolder();
};
