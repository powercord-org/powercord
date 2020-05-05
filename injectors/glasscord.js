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

const https = require('https');
const { join } = require('path');
const { mkdir, unlink } = require('fs').promises;
const { createWriteStream, existsSync } = require('fs');

const glasscordDir = join(__dirname, '..', '.glasscord');
const glasscordFile = join(glasscordDir, 'glasscord.asar');

(async () => {
  switch (process.argv[2]) {
    case 'install': {
      console.log('Installing Glasscord');
      if (!existsSync(glasscordDir)) {
        await mkdir(glasscordDir);
      }
      const file = createWriteStream(glasscordFile);
      const doRequest = (url) => {
        https.get(url, res => {
          if (res.headers.location) {
            return doRequest(res.headers.location);
          }
          res.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log('Successfully installed Glasscord. Please fully restart your Discord client');
          }).on('error', async e => {
            await unlink(glasscordFile);
            console.error('Failed to download Glasscord', e);
            process.exit(-1);
          });
        });
      };
      doRequest('https://github.com/AryToNeX/Glasscord/releases/latest/download/glasscord.asar');
      break;
    }
    case 'uninstall':
      if (!existsSync(glasscordDir) || !existsSync(glasscordFile)) {
        console.log('Glasscord is not installed! Exiting.');
        process.exit(0);
      }
      await unlink(glasscordFile);
      console.log('Successfully uninstalled Glasscord. Please fully restart your Discord client');
      break;
    default:
      console.log(`Unrecognized argument ${process.argv[2]}!`);
      break;
  }
})().catch(e => console.error('fucky wucky', e));
