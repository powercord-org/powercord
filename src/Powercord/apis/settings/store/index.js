const { join } = require('path');
const { existsSync, readdirSync } = require('fs');
const { writeFile, mkdir } = require('fs').promises;

const { Flux, FluxDispatcher } = require('powercord/webpack');
const { SETTINGS_FOLDER } = require('powercord/constants');
const { loadSettings } = require('./actions');
const reducer = require('./reducer');

class SettingsStore extends Flux.Store {
  constructor () {
    super(FluxDispatcher, reducer.reducer(SettingsStore._persist));

    try {
      readdirSync(SETTINGS_FOLDER).map(file => file.split('.')[0]).forEach(loadSettings);
    } catch (_) {
      // heck
    }
  }

  get settings () {
    return reducer.getSettings();
  }

  getSettings (category) {
    return this.settings[category] || {};
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

  static async _persist (category, settings) {
    if (!existsSync(SETTINGS_FOLDER)) {
      await mkdir(SETTINGS_FOLDER);
    }

    await writeFile(join(SETTINGS_FOLDER, `${category}.json`), JSON.stringify(settings, null, 2));
  }
}

const store = new SettingsStore();
module.exports = store;
