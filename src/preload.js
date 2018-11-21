require(process.env.originalPreload);

const Aethcord = require('./Aethcord');
global.aethcord = new Aethcord();
