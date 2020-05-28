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
const { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');
const { SETTINGS_FOLDER, FluxActions: { Settings: ActionTypes } } = require('powercord/constants');
const { Flux, FluxDispatcher } = require('powercord/webpack');

const settings = Object.fromEntries(
  readdirSync(SETTINGS_FOLDER)
    .filter(f => !f.startsWith('.') && f.endsWith('.json'))
    .map(file => [
      file.split('.')[0],
      JSON.parse(
        readFileSync(join(SETTINGS_FOLDER, file), 'utf8')
      )
    ])
);

function updateSettings (category, newSettings) {
  if (!settings[category]) {
    settings[category] = {};
  }
  Object.assign(settings[category], newSettings);
}

function updateSetting (category, setting, value) {
  if (!settings[category]) {
    settings[category] = {};
  }
  if (value === void 0) {
    delete settings[category][setting];
  } else {
    settings[category][setting] = value;
  }
}

function toggleSetting (category, setting, defaultValue) {
  if (!settings[category]) {
    settings[category] = {};
  }
  const previous = settings[category][setting];
  if (previous === void 0) {
    settings[category][setting] = !defaultValue;
  } else {
    settings[category][setting] = !previous;
  }
}

class SettingsStore extends Flux.Store {
  constructor (Dispatcher, handlers) {
    super(Dispatcher, handlers);

    this._persist = global._.debounce(this._persist.bind(this), 1000);
    this.addChangeListener(this._persist);
  }

  getAllSettings () {
    return settings;
  }

  getSettings (category) {
    return settings[category] || {};
  }

  getSetting (category, nodePath, defaultValue) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.getSettings(category);

    for (const fragment of nodePaths) {
      currentNode = currentNode[fragment];
    }

    return (currentNode === void 0 || currentNode === null)
      ? defaultValue
      : currentNode;
  }

  getSettingsKeys (category) {
    return Object.keys(this.getSettings(category));
  }

  _persist () {
    if (!existsSync(SETTINGS_FOLDER)) {
      mkdirSync(SETTINGS_FOLDER);
    }

    for (const category in settings) {
      const file = join(SETTINGS_FOLDER, `${category}.json`);
      const data = JSON.stringify(settings[category], null, 2);
      writeFileSync(file, data);
    }
  }
}

module.exports = new SettingsStore(FluxDispatcher, {
  [ActionTypes.UPDATE_SETTINGS]: ({ category, settings }) => updateSettings(category, settings),
  [ActionTypes.TOGGLE_SETTING]: ({ category, setting, defaultValue }) => toggleSetting(category, setting, defaultValue),
  [ActionTypes.UPDATE_SETTING]: ({ category, setting, value }) => updateSetting(category, setting, value),
  [ActionTypes.DELETE_SETTING]: ({ category, setting }) => toggleSetting(category, setting)
});
