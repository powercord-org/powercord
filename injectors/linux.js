const { existsSync } = require('fs');
const { join } = require('path');

const paths = [
  '/usr/share/discord-canary',
  '/opt/discord-canary'
];

exports.getAppDir = async () => {
  const discordPath = paths
    .filter(path => existsSync(path))[0];

  return join(
    discordPath,
    'resources',
    'app',
  );
};
