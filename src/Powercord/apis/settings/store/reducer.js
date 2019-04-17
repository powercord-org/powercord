const { join } = require('path');
const { SETTINGS_FOLDER, FluxActions: { Settings: ActionTypes } } = require('powercord/constants');

module.exports = function () {
  return {
    [ActionTypes.LOAD_SETTINGS]: ({ category }) => {
      console.log(category);
      let settings = {};
      try {
        settings = require(join(SETTINGS_FOLDER, `${category}.json`));
      } catch (_) {}

      this.settings = {
        ...this.settings,
        [category]: settings
      };
    },

    [ActionTypes.UPDATE_SETTINGS]: ({ category, settings }) => {
      this.settings = {
        ...this.settings,
        [category]: settings
      };
      this._persist(category);
    },

    [ActionTypes.TOGGLE_SETTING]: ({ category, setting }) => {
      this.settings = {
        ...this.settings,
        [category]: {
          ...this.settings[category],
          [setting]: !this.settings[category][setting]
        }
      };
      this._persist(category);
    },

    [ActionTypes.UPDATE_SETTING]: ({ category, setting, value }) => {
      this.settings = {
        ...this.settings,
        [category]: {
          ...this.settings[category],
          [setting]: value
        }
      };
      this._persist(category);
    }
  };
};
