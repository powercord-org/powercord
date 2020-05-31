const { FluxDispatcher } = require('powercord/webpack');
const ActionTypes = require('./constants');

module.exports = {
  toggleSetting (category, setting, defaultValue) {
    FluxDispatcher.dispatch({
      type: ActionTypes.TOGGLE_SETTING,
      category,
      setting,
      defaultValue
    });
  },
  updateSettings (category, settings) {
    FluxDispatcher.dispatch({
      type: ActionTypes.UPDATE_SETTINGS,
      category,
      settings
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
