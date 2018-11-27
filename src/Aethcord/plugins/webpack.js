const Plugin = require('ac/Plugin');
const webpack = require('ac/webpack');

module.exports = class Webpack extends Plugin {
  constructor () {
    super({ stage: 0 });
  }

  async start () {
    await webpack.init();
    Object.assign(this, require('ac/webpack'));
  }
};
