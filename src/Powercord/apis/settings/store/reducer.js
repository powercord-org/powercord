const { join } = require('path');
const { SETTINGS_FOLDER, FluxActions: { Settings: ActionTypes } } = require('powercord/constants');

let settings =  {};

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

      [ActionTypes.UPDATE_SETTINGS]: ({ category, categorySettings }) => {
        settings = {
          ...settings,
          [category]: categorySettings
        };
        persist(category, categorySettings);
      },

      [ActionTypes.TOGGLE_SETTING]: ({ category, setting }) => {
        let categorySettings = settings[category] || {};
        categorySettings = {
          ...categorySettings,
          [setting]: !categorySettings[setting]
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
      }
    };
  }
};
