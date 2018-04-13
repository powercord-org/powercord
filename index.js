const { join } = require('path');
const { _extensions, _load } = require('module');
const { readFileSync } = require('fs');

const injection = join(__dirname, 'src', 'index');
exports.inject = (appPath) => {
  const basePath = join(appPath, '..', 'app.asar');
  const { main } = require(join(basePath, 'package.json'));

  const oldLoader = _extensions['.js'];
  _extensions['.js'] = (mdl, filename) => {
    let content = readFileSync(filename).toString();

    if (filename.endsWith('mainScreen.js')) {
      if ((/mainScreenPreload.js'\)/).test(content)) {
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

      _extensions['.js'] = oldLoader;
    }

    return mdl._compile(content, filename);
  };

  _load(join(basePath, main), null, true);
};
