const {
  readdir, mkdir, writeFile, symlink, unlink, rmdir, access
} = require('fs').promises;
const { join } = require('path');

const createSymlink = async () => {
  if (
    await readdir(join(__dirname, '..'))
      .then(dir => dir.includes('node_modules'))
  ) {
    return null;
  }

  await mkdir(join(__dirname, '..', 'node_modules'));
  return symlink(
    join(__dirname, '..', 'src', '@ac'),
    join(__dirname, '..', 'node_modules', '@ac'),
    'dir'
  );
}
const exists = (path) => {
  return access(path)
    .then(() => true)
    .catch(() => false);
};

const getAppDir = async () => {
  const discordPath = join(process.env.LOCALAPPDATA, 'DiscordCanary');
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory
    .filter(path => path.startsWith('app-'))
    .reverse()[0];

  return join(
    discordPath,
    currentBuild,
    'resources',
    'app'
  );
};

exports.inject = async () => {
  const appDir = await getAppDir();
  if (await exists(appDir)) {
    console.log('Looks like you already have an injector in place. Try uninjecting (`npm run uninject`) and try again.');
    process.exit(1);
  }

  await mkdir(appDir);

  await Promise.all([
    writeFile(
      join(appDir, 'index.js'),
      `require('${join(__dirname, '..', 'src', 'patcher.js').replace(/\\/g, '\\\\')}')`
    ),
    writeFile(
      join(appDir, 'package.json'),
      JSON.stringify({ main: 'index.js' })
    ),
    createSymlink()
  ]);
};

exports.uninject = async () => {
  const appDir = await getAppDir();

  if (!(await exists(appDir))) {
    console.error('There is nothing to uninject.');
    process.exit(1);
  }

  await Promise.all([
    unlink(join(appDir, 'package.json')),
    unlink(join(appDir, 'index.js'))
  ]);

  return rmdir(appDir);
};