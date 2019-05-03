const { existsSync } = require('fs');
const { join } = require('path');
const DiscordTypes = require('./discord-type').linuxTypes;

const paths = [
  '/usr/share/',
  '/usr/lib64/',
  '/opt/'
];

exports.getAppDir = async () => {
  const discordPath = paths
    .map(x => join(x, DiscordTypes[process.env.DISCORDTYPE])).find(path => existsSync(path));

  return join(
    discordPath,
    'resources',
    'app',
  );
};
