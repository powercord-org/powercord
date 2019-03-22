const { React } = require('powercord/webpack');
const { writeFile, mkdir } = require('fs').promises;
const { existsSync } = require('fs');
const { join } = require('path');

const settingsPath = join(__dirname, '..', '..', '..', '..', 'settings');

module.exports = class Category {
  constructor (category) {
    this.settingsFile = join(settingsPath, `${category}.json`);
    this.context = React.createContext();
    this.config = this._load();
  }

  get (nodePath, defaultValue) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.config;

    for (const fragment of nodePaths) {
      currentNode = currentNode[fragment];
    }

    return (currentNode === void 0 || currentNode === null)
      ? defaultValue
      : currentNode;
  }

  set (nodePath, value) {
    const nodePaths = nodePath.split('.');
    let currentNode = this.config;

    for (const fragment of nodePaths) {
      if (nodePaths.indexOf(fragment) === nodePaths.length - 1) {
        currentNode[fragment] = value;
      } else if (!currentNode[fragment]) {
        currentNode[fragment] = {};
      }

      currentNode = currentNode[fragment];
    }

    this._save();
  }

  _setConfig (config) {
    this.config = config;
    this._save();
  }

  _load () {
    try {
      return require(this.settingsFile);
    } catch (_) {
      return {};
    }
  }

  async _save () {
    if (!existsSync(settingsPath)) {
      await mkdir(settingsPath);
    }

    await writeFile(this.settingsFile, JSON.stringify(this.config, null, 2));
  }
};
