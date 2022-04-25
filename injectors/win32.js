const { readdir } = require('fs').promises;
const { join } = require('path');

const PATHS = {
  stable: 'Discord',
  ptb: 'DiscordPTB',
  canary: 'DiscordCanary',
  dev: 'DiscordDevelopment'
};

exports.getAppDir = async (platform) => {
  const discordPath = join(process.env.LOCALAPPDATA, PATHS[platform]);
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory
    .filter(path => path.startsWith('app-'))
    .reverse()[0];

  return join(discordPath, currentBuild, 'resources', 'app');
};
