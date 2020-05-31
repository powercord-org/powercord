const { mkdir, writeFile, unlink, rmdir, access } = require('fs').promises;
const { join, sep } = require('path');

const exists = (path) =>
  access(path)
    .then(() => true)
    .catch(() => false);

exports.inject = async ({ getAppDir }) => {
  const appDir = await getAppDir();
  if (await exists(appDir)) {
    console.log('Looks like you already have an injector in place. Try uninjecting (`npm run unplug`) and try again.');
    return false;
  }

  await mkdir(appDir);

  await Promise.all([
    writeFile(
      join(appDir, 'index.js'),
      `require(\`${__dirname.replace(RegExp(sep.repeat(2), 'g'), '/')}/../src/patcher.js\`)`
    ),
    writeFile(
      join(appDir, 'package.json'),
      JSON.stringify({
        main: 'index.js',
        name: 'discord'
      })
    )
  ]);

  return true;
};

exports.uninject = async ({ getAppDir }) => {
  const appDir = await getAppDir();

  if (!(await exists(appDir))) {
    console.log('There is nothing to uninject.');
    return false;
  }

  await Promise.all([
    unlink(join(appDir, 'package.json')),
    unlink(join(appDir, 'index.js'))
  ]);

  await rmdir(appDir);
  return true;
};
