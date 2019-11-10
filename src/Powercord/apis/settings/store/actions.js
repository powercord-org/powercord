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

const { FluxDispatcher } = require('powercord/webpack');
const { FluxActions: { Settings: ActionTypes } } = require('powercord/constants');

module.exports = {
  loadSettings (category) {
    FluxDispatcher.dispatch({
      type: ActionTypes.LOAD_SETTINGS,
      category
    });
  },

  updateSettings (category, settings) {
    FluxDispatcher.dispatch({
      type: ActionTypes.UPDATE_SETTINGS,
      category,
      settings
    });
  },

  toggleSetting (category, setting, defaultValue) {
    FluxDispatcher.dispatch({
      type: ActionTypes.TOGGLE_SETTING,
      category,
      setting,
      defaultValue
    });
  },

  updateSetting (category, setting, value) {
    FluxDispatcher.dispatch({
      type: ActionTypes.UPDATE_SETTING,
      category,
      setting,
      value
    });
  },

  deleteSetting (category, setting) {
    FluxDispatcher.dispatch({
      type: ActionTypes.DELETE_SETTING,
      category,
      setting
    });
  }
};
