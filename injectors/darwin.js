const discordTypes = require('./discord-type').darwinTypes;
exports.getAppDir = async () => (`/Applications/${(discordTypes[process.env.DISCORDTYPE])}.app/Contents/Resources/app`);
