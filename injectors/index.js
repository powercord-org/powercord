let platformModule;

try {
  platformModule = require(`./${process.platform}.js`);
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    throw new TypeError(`Unsupported platform "${process.platform}"`);
  }

  throw err;
}

const argument = process.argv[2]; // 'inject' | 'uninject'
const targetFunc = platformModule[argument];
if (!targetFunc) {
  throw new TypeError(`Unsupported argument "${argument}"`);
}

return targetFunc()
  .then(() => console.log('☑'))
  .catch(err => {
    console.error('fucky wucky', err);
  });
