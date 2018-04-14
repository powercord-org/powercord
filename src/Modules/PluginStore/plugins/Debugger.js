const Plugin = require('aethcord/Structures/Plugin.js');

module.exports = class Debugger extends Plugin {
  constructor (main) {
    super(main, 'Debugger');
  }

  async onKeyDown (key) {
    if (key.key === 'D' && key.altKey) {
      // eslint-disable-next-line no-debugger
      debugger;
    }
  }

  async load () {
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  async unload () {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
  }
};
