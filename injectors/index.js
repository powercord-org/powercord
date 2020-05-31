// Perform checks
require('./env_check')();

// And then do stuff
require('../polyfills');

const { writeFile } = require('fs').promises;
const { resolve } = require('path');
const main = require('./main.js');

let platformModule;
try {
  platformModule = require(`./${process.platform}.js`);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log(`Unsupported platform "${process.platform}"`);
    process.exit(1);
  }
}

(async () => {
  if (process.argv[2] === 'inject') {
    if (await main.inject(platformModule)) {
      // To show up popup message
      await writeFile(
        resolve(__dirname, '..', 'src', '__injected.txt'),
        'hey cutie'
      );

      console.log('Successfully plugged Powercord!');
    }
  } else if (process.argv[2] === 'uninject') {
    if (await main.uninject(platformModule)) {
      console.log('Successfully unplugged Powercord!');
    }
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting..`);
    process.exit(1);
  }
})().catch(e => console.error('fucky wucky', e));
