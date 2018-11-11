const { Plugin, sleep } = require('@ac');

const modules = require('./modules.json');

module.exports = class Webpack extends Plugin {
  constructor () {
    super({
      stage: 2
    });
  }

  async start () {
    this.webpackInstance = await this.getWebpackInstance();

    for (const mdl in modules) {
      const keys = modules[mdl];
      this[mdl] = await this.getModule(m => keys.every(key => m[key]));
    }
  }

  getWebpackInstance (id = Math.random().toString()) {
    const instance = webpackJsonp.push([
      [],
      { [id]: (_, e, r) => {
        e.cache = r.c;
        e.require = r;
      } },
      [[id]]
    ]);

    delete instance.cache[id];
    return instance;
  }

  async getModule (filter, unsuccessfulIterations = 0) {
    if (unsuccessfulIterations > 16) {
      return null;
    }
  
    const modules = Object.values(this.webpackInstance.cache);
    const mdl = modules.find(mdl => (
      mdl.exports && (
        filter(mdl.exports) ||
        mdl.exports.default && filter(mdl.exports.default)
      )
    ));
  
    if (!mdl) {
      unsuccessfulIterations++;
      return sleep(100)
        .then(this.getModule.bind(this, filter, unsuccessfulIterations));
    }
  
    return mdl.exports.default || mdl.exports;
  }

  stop () {
    console.log('bye');
  }
};
