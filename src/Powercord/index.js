module.exports = class Powercord {
  constructor (config) {
    this.config = config;
    this.plugins = require('./plugins');
    require('./modules');
  }
};
