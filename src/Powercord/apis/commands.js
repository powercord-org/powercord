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

const { API } = require('powercord/entities');

module.exports = class CommandsAPI extends API {
  constructor () {
    super();

    this.commands = [];
  }

  get prefix () {
    return powercord.settings.get('prefix', '.');
  }

  registerCommand (command, aliases, description, usage, func, autocompleteFunc) {
    if (!command.match(/^[a-z0-9_-]+$/i)) {
      return this.error(`Tried to register a command with an invalid name! You can only use letters, numbers, dashes and underscores. (${command})`);
    }

    if (this.commands.find(c => c.command === command || c.aliases.includes(command))) {
      return this.error(`Command name ${command} is already used by another plugin!`);
    }

    aliases = aliases.filter(alias => {
      if (!alias.match(/^[a-z0-9_-]+$/i)) {
        this.error(`Tried to register a command alias with an invalid name! You can only use letters, numbers, dashes and underscores. Alias will be ignored. (${alias})`);
        return false;
      }
      if (this.commands.find(c => c.command === alias || c.aliases.includes(alias))) {
        this.error(`Command alias ${alias} is already used by another plugin! Alias will be ignored.`);
        return false;
      }
      return true;
    });

    return this.commands.push({
      command,
      aliases,
      description,
      usage,
      func,
      autocompleteFunc
    });
  }

  unregisterCommand (command) {
    this.commands = this.commands.filter(c => c.command !== command);
  }
};
