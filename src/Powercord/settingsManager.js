const { resolve } = require('path');
const { writeFile } = require('fs');

let config;
try {
  config = require('../../config.json');
} catch (e) {
  config = {};
}

module.exports = class SettingsManager {
  constructor (category) {
    this.category = category || 'general';
    this.config = config[this.category] || {};
  }

  get (key, defaultValue) {
    const value = this.config[key];
    return (value === void 0 || value === null)
      ? defaultValue
      : value;
  }

  set (key, value) {
    this.config[key] = value;
    this._save();
  }

  _save () {
    const cfg = Object.assign({}, config, { [this.category]: this.config });
    writeFile(resolve(__dirname, '..', '..', 'config.json'), JSON.stringify(cfg, null, 2), () => null);
  }
};
