const { join } = require('path');
const Plugin = require(join(__dirname, '..', '..', '..', 'Structures', 'Plugin'));
const findModule = require(join(__dirname, '..', '..', 'findModule.js'));

const noop = () => {};

module.exports = class SilentTyping extends Plugin {
  constructor (main) {
    super(main, 'SilentTyping');
    this.oldTyping = null;
  }

  monkeypatch () {
    const mdl = findModule(['sendTyping']);
    if (!this.oldTyping) {
      this.oldTyping = mdl.sendTyping;
    }
    mdl.sendTyping = noop;
  }

  load () {
    if (document.readyState === 'complete') { // If the module is being hotreloaded, window.load will already have fired
      this.monkeypatch();
    } else {
      window.addEventListener('load', this.monkeypatch.bind(this));
    }
  }

  unload () {
    const mdl = findModule(['sendTyping']);
    mdl.sendTyping = this.oldTyping;
  }
};
