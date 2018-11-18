require(process.env.originalPreload);

global.require = require;
global.process = process;

const Aethcord = require('./Aethcord');
global.aethcord = new Aethcord();
