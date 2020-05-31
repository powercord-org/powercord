const { join } = require('path');
const { existsSync } = require('fs');
const { execSync } = require('child_process');

const rootPath = join(__dirname, '..');
const nodeModulesPath = join(rootPath, 'node_modules');

function installDeps () {
  console.log('Installing dependencies...');
  execSync('npm install --only=prod', {
    cwd: rootPath,
    stdio: [ null, null, null ]
  });
  console.log('Dependencies successfully installed!');
}

module.exports = () => {
  // Don't clone in System32
  if (__dirname.toLowerCase().replace(/\\/g, '/').includes('/windows/system32')) {
    console.error('Powercord shouldn\'t be cloned in System32, as this will generate conflicts and bloat your Windows installation. Please remove it and clone it in another place.\n' +
      'Note: Not opening cmd as administrator will be enough.');
    process.exit(1);
  }

  // Verify if we're on node 10.x
  const fs = require('fs');
  if (!fs.promises) {
    console.error('You\'re on an outdated Node.js version. Powercord requires you to run at least Node 10. You can download it here: https://nodejs.org');
    process.exit(1);
  }

  // Verify if deps have been installed. If not, install them automatically
  if (!existsSync(nodeModulesPath)) {
    installDeps();
  } else {
    const { dependencies } = require('../package.json');
    for (const dependency in dependencies) {
      const depPath = join(nodeModulesPath, dependency);
      if (!existsSync(depPath)) {
        installDeps();
        break;
      }
      const expectedFrom = `${dependency}@${dependencies[dependency]}`;
      const depPackage = require(join(depPath, 'package.json'));
      if (expectedFrom !== depPackage._from) {
        installDeps();
        break;
      }
    }
  }
};
