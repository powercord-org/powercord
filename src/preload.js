require('../polyfills');

const { remote } = require('electron');
const { join } = require('path');

require('module')
  .Module
  .globalPaths
  .push(
    join(__dirname, 'fake_node_modules')
  );

const isOverlay = (/overlay/).test(location.pathname);

const Powercord = require('./Powercord');
global.powercord = new Powercord();

// if (powercord.settings.get('openOverlayDevTools', false) && isOverlay) {
if (isOverlay) {
  // Discord is gay and localStorage is not the same in client and in overlay
  setTimeout(() => {
    remote
      .getCurrentWindow()
      .openDevTools({
        mode: 'detach'
      });
  }, 1500);
}

// https://github.com/electron/electron/issues/9047
if (
  process.platform === 'darwin' &&
  !process.env.PATH.includes('/usr/local/bin')
) {
  process.env.PATH += ':/usr/local/bin';
}

require(remote.getGlobal('originalPreload'));
