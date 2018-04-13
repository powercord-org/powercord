const { join } = require('path');
const Plugin = require(join(__dirname, '..', '..', 'Structures', 'Plugin'));

const noop = () => {};

module.exports = class SilentTyping extends Plugin {
  constructor (main) {
    super(main, 'SilentTyping');
    this.oldTyping = null;
  }

  getModule () {
    const modules = webpackJsonp([], {
      '__extra_id__': (_, exports, req) => { exports.default = req; }
    }, ['__extra_id__']).default.c;
    delete modules['__extra_id__'];

    for (let mdl in modules) {
      mdl = modules[mdl].exports;
      if (mdl && mdl.sendTyping) {
        if (!this.oldTyping) {
          this.oldTyping = mdl.sendTyping;
        }
        return mdl;
      }
    }
  }

  monkeypatch () {
    this.getModule().sendTyping = noop;
  }

  load () {
    if (document.readyState === 'complete') { // If the module is being hotreloaded, window.load will already have fired
      return this.monkeypatch();
    } else {
      window.addEventListener('load', this.monkeypatch.bind(this));
    }
  }

  unload () {
    this.getModule().sendTyping = this.oldTyping;
  }
};
