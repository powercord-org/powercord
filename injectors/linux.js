const { join } = require('path');
const { existsSync } = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

exports.getAppDir = async () => {
  const discordProcess = execSync('ps x')
    .toString()
    .split('\n')
    .map(s => s.split(' ').filter(Boolean))
    .find(p => p[4] && (/discord-?canary$/i).test(p[4]) && p.includes('--type=renderer'));

  if (!discordProcess) {
    console.log('Cannot find Discord process, falling back to legacy path detection.');
    const paths = [
      '/usr/share/discord-canary',
      '/usr/lib64/discord-canary',
      '/opt/discord-canary',
      '/opt/DiscordCanary'
    ];
    let discordPath = paths.find(path => existsSync(path));

    if (discordPath === undefined) {
      const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      console.log('A Discord Canary installation could not be found at the usual paths.')
       discordPath = await new Promise(resolve => readlineInterface.question('Provide your Discord Canary install location: ', customDiscordPath => {
        if (existsSync(customDiscordPath)) {
          readlineInterface.close();
          resolve(customDiscordPath);
        } else {
          console.log('Path provided is invalid, aborting.');
          process.exit(1);
        }
        
      }));
    }

    return join(discordPath, 'resources', 'app');
  }

  const discordPath = discordProcess[4].split('/');
  discordPath.splice(discordPath.length - 1, 1);
  return join('/', ...discordPath, 'resources', 'app');
};
