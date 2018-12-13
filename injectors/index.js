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
    await main.inject(platformModule);
  } else if (process.argv[2] === 'uninject') {
    await main.uninject(platformModule);
  } else {
    console.log(`Unsupported argument "${process.argv[2]}", exiting..`);
    process.exit(1);
  }
})()
  .then(() => console.log('Success!'))
  .catch(e => console.error('fucky wucky', e));
