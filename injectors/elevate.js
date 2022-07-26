const { spawnSync } = require('child_process');

function tryToElevate (command) {
  const { error } = spawnSync(command, process.argv, { stdio: 'inherit' });
  if (!error) {
    process.exit(0);
  } else if (error.code !== 'ENOENT') {
    console.error(error);
    process.exit(process.argv.includes('--no-exit-codes') ? 0 : 1);
  }
}

// It seems `sudo npm ...` no longer gives the script sudo perms in npm v7, so here we are.
if (process.platform === 'linux' && process.getuid() !== 0) {
  tryToElevate('sudo');
  tryToElevate('doas');

  console.warn('Neither doas nor sudo were found. Falling back to su.');
  console.log('Please enter your root password');
  spawnSync('su', [ '-c', process.argv.join(' ') ], { stdio: 'inherit' });
  process.exit(0);
}
