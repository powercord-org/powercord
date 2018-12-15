const { remote } = require('electron');
const { join } = require('path');

require('module')
  .Module
  .globalPaths
  .push(
    join(__dirname, 'fake_node_modules')
  );

let config;
try {
  config = require('../config.json');
} catch (e) {
  config = {};
}

const Powercord = require('./Powercord');
global.powercord = new Powercord(config);

if (config.openOverlayDevTools && location.pathname === '/overlay') {
  remote
    .getCurrentWindow()
    .openDevTools({
      mode: 'detach'
    });
}

require(remote.getGlobal('originalPreload'));
