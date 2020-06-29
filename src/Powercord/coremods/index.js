const coremods = require('./registry');
const unloadFuncs = [];

module.exports = {
  async load () {
    for (const mod of coremods) {
      const unload = await mod();
      if (typeof unload === 'function') {
        unloadFuncs.push(unload);
      }
    }
  },
  unload () {
    return Promise.all(unloadFuncs.map(f => f()));
  }
};
