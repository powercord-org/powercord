const Plugin = require('powercord/Plugin');
const webpack = require('powercord/webpack');

module.exports = class Webpack extends Plugin {
  constructor () {
    super({ stage: 0 });
  }

  async start () {
    await webpack.init();
    Object.assign(this, require('powercord/webpack'));
  }
};
