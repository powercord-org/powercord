const { join } = require('path');
const Module = require('module');
const { readFileSync } = require('fs');
// const electron = require('electron');

const injection = join(__dirname, 'src', 'index');
exports.inject = (appPath) => {
  const basePath = join(appPath, '..', 'app.asar');
  // electron.app.getAppPath = () => basePath;
  const { main } = require(join(basePath, 'package.json'));

  let mainWindowPatched = false;

  const oldLoader = Module._extensions['.js'];
  Module._extensions['.js'] = (mod, filename) => {
    let content = readFileSync(filename, 'utf8');
    const fname = filename.toLowerCase();

    if (fname.endsWith('mainscreen.js')) {
      mainWindowPatched = true;

      if (content.match(/mainScreenPreload.js'\)/)) {
        content = content.replace(
          /preload: .*\)/,
          `preload: '${injection}'`
        );
      } else {
        content = content.replace(
          'webPreferences: {',
          `webPreferences: { preload: '${injection}',`
        );
      }
    }

    if (mainWindowPatched) {
      Module._extensions['.js'] = oldLoader;
    }

    return mod._compile(content, filename);
  };

  Module._load(join(basePath, main), null, true);
};
