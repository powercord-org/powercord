const Events = require('events');

module.exports = class Plugin extends Events {
  constructor (options) {
    super();

    this.options = {
      stage: 0,
      dependencies: [],
      ...options
    };
    this.ready = false;
  }

  async _start () {
    await this.start();
    return (this.ready = true);
  }

  _stop () {
    this.ready = false;
    return this.stop();
  }
};