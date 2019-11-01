const { Plugin } = require('powercord/entities');
const encryptor = require('./encryptor');

module.exports = class Test extends Plugin {
  constructor () {
    super();
    // for ez access in console
    this.encryptor = encryptor;
  }

  // eslint-disable-next-line no-empty-function
  startPlugin () {}
};
