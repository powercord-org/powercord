const Plugin = require('@ac/Plugin');
const { sleep } = require('@ac/util');

const modules = require('./modules.json');

module.exports = class Webpack extends Plugin {
  constructor () {
    super({
      stage: 2
    });
    this.modules = modules;
  }

  async start () {
    this.webpackInstance = this.getWebpackInstance();

    for (const mdl in modules) {
      const keys = modules[mdl];
      let target = {};

      if (keys.some(Array.isArray)) {
        for (const nestedKeys of keys) {
          Object.assign(target, await this.getModule(nestedKeys));
        }
      } else {
        target = await this.getModule(keys);
      }

      this[mdl] = target;
    }
  }

  getWebpackInstance (id = Math.random().toString()) {
    const instance = webpackJsonp.push([
      [],
      { [id]: (_, e, r) => {
        e.cache = r.c;
        e.require = r;
      } },
      [ [ id ] ]
    ]);

    delete instance.cache[id];
    return instance;
  }

  async getModule (filter, unsuccessfulIterations = 0) {
    if (Array.isArray(filter)) {
      const keys = filter;
      filter = m => keys.every(key => m[key]);
    }

    if (unsuccessfulIterations > 16) {
      return null;
    }

    const moduleInstances = Object.values(this.webpackInstance.cache);
    const mdl = moduleInstances.find(m => (
      m.exports && (
        filter(m.exports) ||
        (m.exports.default && filter(m.exports.default))
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
