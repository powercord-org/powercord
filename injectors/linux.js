const { existsSync } = require('fs');
const { join } = require('path');

const paths = [
  '/usr/share/discord-canary',
  '/usr/lib64/discord-canary',
  '/opt/discord-canary',
];

exports.getAppDir = async () => {
  const discordPath = paths
    .find(path => existsSync(path));

  return join(
    discordPath,
    'resources',
    'app',
  );
};
