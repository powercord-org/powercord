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

  get (key, defautlVal) {
    if (typeof this.config[key] === 'undefined' || this.config[key] === null) {
      return defautlVal;
    }
    return this.config[key];
  }

  set (key, value) {
    this.config[key] = value;
    this._save();
  }

  _save () {
    const cfg = {
      ...config,
      [this.category]: this.config
    };

    console.log(cfg);
    writeFile(resolve(__dirname, '..', '..', 'config.json'), JSON.stringify(cfg, null, 2), () => null);
  }
};
