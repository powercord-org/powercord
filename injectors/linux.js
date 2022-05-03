const { join } = require('path');
const { existsSync } = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');
const { BasicMessages, AnsiEscapes } = require('./log');

// This is to ensure the homedir we get is the actual user's homedir instead of root's homedir
const homedir = execSync('grep $(logname) /etc/passwd | cut -d ":" -f6').toString().trim();

const KnownLinuxPaths = Object.freeze([
  '/usr/share/discord-canary',
  '/usr/lib64/discord-canary',
  '/opt/discord-canary',
  '/opt/DiscordCanary',
  `${homedir}/.local/bin/DiscordCanary` // https://github.com/powercord-org/powercord/pull/370
]);


exports.getAppDir = async () => {
  const discordProcess = execSync('ps x')
    .toString()
    .split('\n')
    .map(s => s.split(' ').filter(Boolean))
    .find(p => p[4] && (/discord-?canary$/i).test(p[4]) && p.includes('--type=renderer'));
    const askPath = () => new Promise(resolve => readlineInterface.question('> ', resolve));
    const readlineInterface = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  if (!discordProcess) {

    let discordPaths = KnownLinuxPaths.filter(path => existsSync(path));
   
    if (!discordPaths[0]) {
      console.log(`${AnsiEscapes.YELLOW}Failed to locate Discord Canary installation folder.${AnsiEscapes.RESET}`, '\n');
      console.log('Please provide the path of your Discord Canary installation folder');
      discordPath = await askPath();

      if (!existsSync(discordPath)) {
        console.log('');
        console.log(BasicMessages.PLUG_FAILED);
        console.log('The path you provided is invalid.');
        process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
      }
    }
    if(discordPaths.length > 0) {
      console.log(`${AnsiEscapes.YELLOW}It seems like you have multiple canary instances. ${AnsiEscapes.RESET}`, '\n');
      console.log('Please provide the path of your preffered Discord Canary installation folder');
      discordPaths[0] = await askPath();

    }
    
    return discordPaths[0];
  }
  readlineInterface.close();

  const discordPath = discordProcess[4].split('/');
  discordPath.splice(discordPath.length - 1, 1);
  return join('/', ...discordPath, 'resources', 'app');
};
