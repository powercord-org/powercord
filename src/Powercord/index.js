const EventEmitter = require('events');

module.exports = class Powercord extends EventEmitter {
  constructor (config) {
    super();

    this.config = config;
    this.plugins = require('./plugins');
    require('./modules');
  }
};
