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

const { join } = require('path');
const { readdirSync, statSync } = require('fs');

module.exports = class APIManager {
  constructor () {
    this.apiDir = join(__dirname, '..', 'apis');
    this.apis = [];
  }

  mount (api) {
    try {
      const APIClass = require(join(this.apiDir, api));
      api = api.replace(/\.js$/, '');
      powercord.api[api] = new APIClass();
      this.apis.push(api);
    } catch (e) {
      console.error('%c[Powercord:API]', 'color: #7289da', `An error occurred while initializing "${api}"!`, e);
    }
  }

  async load () {
    for (const api of this.apis) {
      await powercord.api[api]._load();
    }
  }

  async unload () {
    for (const api of this.apis) {
      await powercord.api[api]._unload();
    }
  }

  // Start
  async startAPIs () {
    this.apis = [];
    readdirSync(this.apiDir)
      .filter(f => statSync(join(this.apiDir, f)).isFile())
      .forEach(filename => this.mount(filename));
    await this.load();
  }
};
