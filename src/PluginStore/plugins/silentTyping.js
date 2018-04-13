const noop = () => {};

module.exports = {
  init () {
    window.addEventListener('load', () => {
      const modules = webpackJsonp([], {
        '__extra_id__': (module, exports, req) => { exports.default = req; }
      }, ['__extra_id__']).default.c;
      delete modules['__extra_id__'];

      for (let module in modules) {
        module = modules[module].exports;
        if (module && module.sendTyping) {
          module.sendTyping = noop;
        }
      }
    });
  },
  unload () {}
};
