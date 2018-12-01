module.exports = class Aethcord {
  constructor (config) {
    this.config = config;
    this.plugins = require('./plugins');
    require('./modules');
  }
};
