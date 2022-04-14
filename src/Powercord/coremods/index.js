const coremods = require('./registry');
const unloadFuncs = [];

module.exports = {
  async load () {
    for (const mod of coremods) {
      try {
        const unload = await mod();
        if (typeof unload === 'function') {
          unloadFuncs.push(unload);
        }
      } catch (e) {
        console.error(e); // Stronger logging + warning
      }
    }
  },

  unload () {
    return Promise.all(unloadFuncs.map(f => f()));
  }
};
