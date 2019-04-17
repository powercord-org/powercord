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

  toggleSetting (category, setting) {
    FluxDispatcher.dispatch({
      type: ActionTypes.TOGGLE_SETTING,
      category,
      setting
    });
  },

  updateSetting (category, setting, value) {
    FluxDispatcher.dispatch({
      type: ActionTypes.UPDATE_SETTING,
      category,
      setting,
      value
    });
  }
};
