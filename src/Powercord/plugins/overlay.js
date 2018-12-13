const Plugin = require('powercord/Plugin');
const { remote } = require('electron');

module.exports = class Overlay extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [],
      appMode: 'overlay'
    });
  }

  start () {
    document.addEventListener('keydown', e => {
      if (e.key === 'I' && e.ctrlKey) {
        const remoteWindow = remote.getCurrentWindow();

        if (!remoteWindow.isDevToolsOpened()) {
          remoteWindow.openDevTools({
            mode: 'detach'
          });
        }
      }
    });
  }
};
