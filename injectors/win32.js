const { readdir } = require('fs').promises;
const { join } = require('path');
const DiscordTypes = require('./discord-type').winTypes;

exports.getAppDir = async () => {
  console.log(`Discord Type: ${process.env.DISCORDTYPE}`);
  const discordPath = join(process.env.LOCALAPPDATA, DiscordTypes[process.env.DISCORDTYPE]);
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory
    .filter(path => path.startsWith('app-'))
    .reverse()[0];

  return join(
    discordPath,
    currentBuild,
    'resources',
    'app'
  );
};