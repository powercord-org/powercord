const { remote } = require('electron');
const { join } = require('path');

require(remote.getGlobal('originalPreload'));

require('module')
  .Module
  .globalPaths
  .push(
    join(__dirname, 'fake_node_modules')
  );

const Aethcord = require('./Aethcord');
global.aethcord = new Aethcord();
