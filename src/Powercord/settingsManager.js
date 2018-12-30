const { resolve } = require('path');
const { writeFile } = require('fs');

const configPath = resolve(__dirname, '..', '..', 'config.json');

let config;
try {
  config = require(configPath);
} catch (e) {
  config = {};
}

module.exports = class SettingsManager {
  constructor (category) {
    if (!category) {
      throw new TypeError('Missing SettingsManager category name');
    }

    this.category = category;
    this.config = config[this.category] || {};
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

  _save () {
    Object.assign(config, {
      [this.category]: this.config
    });

    writeFile(configPath, JSON.stringify(config, null, 2), () => {});
  }
};
