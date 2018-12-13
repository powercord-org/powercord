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

window.WebSocket = class PatchedWebSocket extends window.WebSocket {
  constructor (url) {
    super(url);

    this.addEventListener('message', (data) => {
      powercord.emit(`webSocketMessage:${data.origin.slice(6)}`, data);
    });
  }
};

require(remote.getGlobal('originalPreload'));
