require('./elevate');
require('./env_check')(); // Perform checks
require('../polyfills'); // And then do stuff

const { join } = require('path');
const { writeFile } = require('fs').promises;
const readline = require('readline');
const { AnsiEscapes, BasicMessages } = require('./log');
const main = require('./main.js');

async function promptYesNo (question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(
        answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes'
      );
    });
  });
}

let platformModule;
try {
  platformModule = require(`./${process.platform}.js`);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(BasicMessages.PLUG_FAILED, '\n');
    console.log('It seems like your platform is not supported yet.', '\n');
    console.log(
      'Feel free to open an issue about it, so we can add support for it!'
    );
    console.log(
      `Make sure to mention the platform you are on is "${process.platform}" in your issue ticket.`
    );
    console.log(
      'https://github.com/replugged-org/replugged/issues/new/choose'
    );
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
}

const VALID_PLATFORMS = [ 'stable', 'ptb', 'canary', 'dev', 'development' ];

(async () => {
  let platform = (
    process.argv.find(x => VALID_PLATFORMS.includes(x.toLowerCase())) || 'canary'
  ).toLowerCase();
  if (platform === 'development') {
    platform = 'dev';
  }

  if (platform !== 'canary' && process.argv[2] === 'inject') {
    console.log(
      `${AnsiEscapes.BOLD}${AnsiEscapes.YELLOW}WARNING: using non-canary versions of Discord is not supported.${AnsiEscapes.RESET}`
    );
    console.log(
      `${AnsiEscapes.YELLOW}These versions may not work properly and support will not be given.${AnsiEscapes.RESET}`
    );
    const response = await promptYesNo(
      'Are you sure you want to continue? [y/n]: '
    );
    if (!response) {
      console.log('Aborting...');
      process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
    }
    console.log('Continuing...', '\n');
  }

  if (process.argv[2] === 'inject') {
    if (await main.inject(platformModule, platform)) {
      if (!process.argv.includes('--no-welcome-message')) {
        await writeFile(
          join(__dirname, '../src/__injected.txt'),
          'hey cutie'
        );
      }

      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.PLUG_SUCCESS, '\n');
      console.log(
        'You now have to completely close the Discord client, from the system tray or through the task manager.'
      );
    }
  } else if (process.argv[2] === 'uninject') {
    if (await main.uninject(platformModule, platform)) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.UNPLUG_SUCCESS, '\n');
      console.log(
        'You now have to completely close the Discord client, from the system tray or through the task manager.'
      );
    }
  } else if (process.argv[2] === 'repair') {
    if (await main.uninject(platformModule, platform)) {
      // @todo: prompt to (re)start automatically
      console.log(BasicMessages.UNPLUG_SUCCESS, '\n');
      
      if (await main.repair()) {
        if (await main.inject(platformModule, platform)) {
          await writeFile( // Don't show yay plugged on launch
            join(__dirname, '../src/__injected.txt'),
            'hey cutie'
          );

          // @todo: prompt to (re)start automatically
          console.log(BasicMessages.PLUG_SUCCESS, '\n');
          console.log(
            'You now have to completely close the Discord client, from the system tray or through the task manager.'
          );
        }
      }
    }
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting.`);
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
})().catch(e => {
  if (e.code === 'EACCES') {
    console.log(
      process.argv[2] === 'inject'
        ? BasicMessages.PLUG_FAILED
        : BasicMessages.UNPLUG_FAILED,
      '\n'
    );
    console.log(
      'Replugged wasn\'t able to inject itself due to missing permissions.',
      '\n'
    );
    console.log('Try again with elevated permissions.');
  } else {
    console.error('fucky wucky', e);
  }
});
