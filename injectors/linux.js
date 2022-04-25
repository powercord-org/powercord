const { join } = require('path');
const { existsSync } = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');
const { BasicMessages, AnsiEscapes, PlatformNames } = require('./log');

// This is to ensure the homedir we get is the actual user's homedir instead of root's homedir
const homedir = execSync('grep $(logname) /etc/passwd | cut -d ":" -f6').toString().trim();

const KnownLinuxPaths = Object.freeze({
  stable: [
    '/usr/share/discord',
    '/usr/lib64/discord',
    '/opt/discord',
    '/opt/Discord',
    `${homedir}/.local/bin/Discord`
  ],
  ptb: [
    '/usr/share/discord-ptb',
    '/usr/lib64/discord-ptb',
    '/opt/discord-ptb',
    '/opt/DiscordPTB',
    `${homedir}/.local/bin/DiscordPTB`
  ],
  canary: [
    '/usr/share/discord-canary',
    '/usr/lib64/discord-canary',
    '/opt/discord-canary',
    '/opt/DiscordCanary',
    `${homedir}/.local/bin/DiscordCanary` // https://github.com/powercord-org/powercord/pull/370
  ],
  dev: [
    '/usr/share/discord-development',
    '/usr/lib64/discord-development',
    '/opt/discord-development',
    '/opt/DiscordDevelopment',
    `${homedir}/.local/bin/DiscordDevelopment`
  ]
});

const ProcessRegex = {
  stable: /discord$/i,
  ptb: /discord-?ptb$/i,
  canary: /discord-?canary$/i,
  dev: /discord-?development$/i
};

exports.getAppDir = async (platform) => {
  const discordProcess = execSync('ps x')
    .toString()
    .split('\n')
    .map(s => s.split(' ').filter(Boolean))
    .find(p => p[4] && (ProcessRegex[platform]).test(p[4]) && p.includes('--type=renderer'));

  if (!discordProcess) {
    let discordPath = KnownLinuxPaths[platform].find(path => existsSync(path));
    if (!discordPath) {
      const readlineInterface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const askPath = () => new Promise(resolve => readlineInterface.question('> ', resolve));
      console.log(`${AnsiEscapes.YELLOW}Failed to locate ${PlatformNames[platform]} installation folder.${AnsiEscapes.RESET}`, '\n');
      console.log(`Please provide the path of your ${PlatformNames[platform]} installation folder`);
      discordPath = await askPath();
      readlineInterface.close();

      if (!existsSync(discordPath)) {
        console.log('');
        console.log(BasicMessages.PLUG_FAILED);
        console.log('The path you provided is invalid.');
        process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
      }
    }

    return join(discordPath, 'resources', 'app');
  }

  const discordPath = discordProcess[4].split('/');
  discordPath.splice(discordPath.length - 1, 1);
  return join('/', ...discordPath, 'resources', 'app');
};
