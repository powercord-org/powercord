/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { ipcRenderer } = require('electron');
const { join } = require('path');
require('./ipc/renderer');

// Add Powercord's modules
require('module').Module.globalPaths.push(join(__dirname, 'fake_node_modules'));

// Discord's preload
const preload = ipcRenderer.sendSync('POWERCORD_GET_PRELOAD');
if (preload) {
  require(preload);
}

window.__SPLASH__ = true;

// CSS Injection
function init () {
  document.body.classList.add('powercord');
  const StyleManager = require('./Powercord/managers/styles');
  global.sm = new StyleManager();
  global.sm.loadThemes();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
