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

const { join } = require('path');
const { SETTINGS_FOLDER, FluxActions: { Settings: ActionTypes } } = require('powercord/constants');

let settings = {};

module.exports = {
  getSettings: () => settings,

  reducer (persist) {
    return {
      [ActionTypes.LOAD_SETTINGS]: ({ category }) => {
        let categorySettings = {};
        try {
          categorySettings = require(join(SETTINGS_FOLDER, `${category}.json`));
        } catch (_) {
        }

        settings = {
          ...settings,
          [category]: categorySettings
        };
      },

      [ActionTypes.UPDATE_SETTINGS]: ({ category, settings }) => {
        let categorySettings = settings[category] || {};
        categorySettings = {
          ...categorySettings,
          ...settings
        };

        settings = {
          ...settings,
          [category]: categorySettings
        };
        persist(category, categorySettings);
      },

      [ActionTypes.TOGGLE_SETTING]: ({ category, setting, defaultValue }) => {
        let categorySettings = settings[category] || {};
        const oldValue = categorySettings[setting];
        categorySettings = {
          ...categorySettings,
          [setting]: oldValue === void 0 ? !defaultValue : !oldValue
        };

        settings = {
          ...settings,
          [category]: categorySettings
        };
        persist(category, categorySettings);
      },

      [ActionTypes.UPDATE_SETTING]: ({ category, setting, value }) => {
        let categorySettings = settings[category] || {};
        categorySettings = {
          ...categorySettings,
          [setting]: value
        };

        settings = {
          ...settings,
          [category]: categorySettings
        };
        persist(category, categorySettings);
      },

      [ActionTypes.DELETE_SETTING]: ({ category, setting }) => {
        const categorySettings = settings[category] || {};
        delete categorySettings[setting];

        settings = {
          ...settings,
          [category]: categorySettings
        };
        persist(category, categorySettings);
      }
    };
  }
};
