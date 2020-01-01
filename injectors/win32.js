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

const { readdir } = require('fs').promises;
const { join } = require('path');

exports.getAppDir = async () => {
  const discordPath = join(process.env.LOCALAPPDATA, 'DiscordCanary');
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory
    .filter(path => path.startsWith('app-'))
    .reverse()[0];

  return join(
    discordPath,
    currentBuild,
    'resources',
    'app'
  );
};
