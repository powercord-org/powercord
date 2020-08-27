/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { remote } = require('electron'); // @todo: remove

module.exports = async () => {
  document.body.classList.add('powercord');
  if (window.__OVERLAY__) {
    document.body.classList.add('overlay');
  }
  const webPrefs = remote.getCurrentWebContents().getWebPreferences();
  if (webPrefs.transparent) {
    document.body.classList.add('transparent');
  }
  if (webPrefs.experimentalFeatures) {
    document.body.classList.add('experimental-web-features');
  }
  const date = new Date();
  if (date.getMonth() === 3 && date.getDate() === 1) {
    document.body.classList.add('april-fools');
  }

  if (remote.getCurrentWindow().isMaximized()) {
    document.body.classList.add('maximized');
  } else {
    document.body.classList.remove('maximized');
  }

  remote.getCurrentWindow().on('maximize', () => document.body.classList.add('maximized'));
  remote.getCurrentWindow().on('unmaximize', () => document.body.classList.remove('maximized'));
};
