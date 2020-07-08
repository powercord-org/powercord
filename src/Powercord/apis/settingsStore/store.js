const { join } = require('path');
const { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } = require('fs');
const { SETTINGS_FOLDER } = require('powercord/constants');
const { Flux, FluxDispatcher } = require('powercord/webpack');
const ActionTypes = require('./constants');

if (!existsSync(SETTINGS_FOLDER)) {
  mkdirSync(SETTINGS_FOLDER);
}

function loadSettings (file) {
  const categoryId = file.split('.')[0];
  try {
    return [
      file.split('.')[0],
      JSON.parse(
        readFileSync(join(SETTINGS_FOLDER, file), 'utf8')
      )
    ];
  } catch (e) {
    // Maybe corrupted settings; Let's consider them empty
    return [ categoryId, {} ];
  }
}

const settings = Object.fromEntries(
  readdirSync(SETTINGS_FOLDER)
    .filter(f => !f.startsWith('.') && f.endsWith('.json'))
    .map(loadSettings)
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

function deleteSetting (category, setting) {
  if (!settings[category]) {
    settings[category] = {};
  }
  delete settings[category][setting];
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
  [ActionTypes.DELETE_SETTING]: ({ category, setting }) => deleteSetting(category, setting)
});
