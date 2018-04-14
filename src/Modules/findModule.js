// Go show Zerebos some ❤ for helping me understand this :>

const { cache } = webpackJsonp(['__aethcord_webpack__'], {
  '__aethcord_webpack__': (_, e, req) => {
    e.cache = req.c;
  }
}, ['__aethcord_webpack__']);

module.exports = (properties) => {
  for (const mdl of Object.values(cache)) {
    if (properties.every(prop => mdl.exports[prop])) {
      return mdl.exports;
    }
  }
};
