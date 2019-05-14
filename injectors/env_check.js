const { resolve } = require('path');
const { execSync } = require('child_process');

module.exports = () => {
  // Verify if we're on node 10.x
  const fs = require('fs');
  if (!fs.promises) {
    console.error('You\'re on an outdated Node.js version. Powercord requires you to run at least Node 10. You can download it there: https://nodejs.org');
    process.exit(1);
  }

  // Verify if deps have been installed. If not, install them automatically
  try {
    require('buble');
  } catch (_) {
    console.log('Dependencies are not installed. Let\'s fix that...');
    execSync('npm install --only=prod', {
      cwd: resolve(__dirname, '..'),
      stdio: [ null, null, null ]
    });
  }
};
