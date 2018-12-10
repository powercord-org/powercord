const Plugin = require('powercord/Plugin');
const { remote } = require('electron');

module.exports = class Overlay extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [],
      overlay: true
    });
  }

  start () {
    document.addEventListener('keydown', e => {
      if (e.key === 'I' && e.ctrlKey) {
        remote.getCurrentWindow().toggleDevTools({
          detached: true
        });
      }
    })
  }
};
