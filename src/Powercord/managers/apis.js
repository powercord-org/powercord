const { resolve } = require('path');
const { readdirSync } = require('fs');

module.exports = class APIManager {
  constructor () {
    this.apiDir = resolve(__dirname, '..', 'apis');
    this.apis = [];
  }

  mount (api) {
    try {
      const APIClass = require(resolve(this.apiDir, api));
      api = api.replace(/\.js$/, '');
      powercord.api[api] = new APIClass();
      this.apis.push(api);
    } catch (e) {
      console.error('%c[Powercord:API]', 'color: #257dd4', `An error occurred while initializing "${api}"!`, e);
    }
  }

  async load () {
    for (const api of this.apis) {
      await powercord.api[api]._load();
    }
  }

  async unload () {
    for (const api of this.apis) {
      await powercord.api[api]._unload();
    }
  }

  // Start
  async startAPIs () {
    readdirSync(this.apiDir).forEach(filename => this.mount(filename));
    await this.load();
  }
};
