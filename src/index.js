const { join } = require('path');

const Aethcord = require(join(__dirname, 'Aethcord.js'));
global.Aethcord = new Aethcord();

process.once('loaded', () => {
  if (!global.process) {
    global.process = process;
  }
  if (!global.require) {
    global.require = require;
  }
});
