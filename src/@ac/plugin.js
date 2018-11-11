module.exports = class Plugin {
  constructor (options) {
    this.options = options;
    this.ready = false;
  }

  _start () {
    this.ready = true;
    return this.start();
  }

  _stop () {
    this.ready = false;
    return this.stop();
  }
};