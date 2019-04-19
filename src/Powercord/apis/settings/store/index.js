const { join } = require('path');
const { existsSync, readdirSync } = require('fs');
const { writeFile, mkdir } = require('fs').promises;

const { Flux, FluxDispatcher } = require('powercord/webpack');
const { SETTINGS_FOLDER } = require('powercord/constants');
const { loadSettings } = require('./actions');
const reducer = require('./reducer');

class SettingsStore extends Flux.Store {
  constructor (dispatcher, reducer) {
    super(dispatcher, {});
    this._actionHandlers = reducer.call(this);

    this.settings = {};
    readdirSync(SETTINGS_FOLDER).map(file => file.split('.')[0]).forEach(loadSettings);
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

  async _persist (category) {
    if (!existsSync(SETTINGS_FOLDER)) {
      await mkdir(SETTINGS_FOLDER);
    }

    await writeFile(join(SETTINGS_FOLDER, `${category}.json`), JSON.stringify(this.settings[category], null, 2));
  }
}

const store = new SettingsStore(FluxDispatcher, reducer);
module.exports = store;
