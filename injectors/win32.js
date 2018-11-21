const { readdir, mkdir, writeFile, symlink } = require('fs').promises;
const { join } = require('path');

(async () => {
  const createSymlink = await readdir(__dirname)
    .then(dir => !dir.includes('node_modules'));

  const discordPath = join(process.env.LOCALAPPDATA, 'DiscordCanary');
  const discordDirectory = await readdir(discordPath);

  const currentBuild = discordDirectory
    .filter(path => path.startsWith('app-'))
    .reverse()[0];

  const appDir = join(
    discordPath,
    currentBuild,
    'resources',
    'app'
  );
  await mkdir(appDir);

  if (createSymlink) {
    await mkdir(join(__dirname, '..', 'node_modules'));
  }

  await Promise.all([
    writeFile(
      join(appDir, 'index.js'),
      `require('${join(__dirname, '..', 'src', 'patcher.js').replace(/\\/g, '\\\\')}')`
    ),
    writeFile(
      join(appDir, 'package.json'),
      JSON.stringify({ main: 'index.js' })
    ),
    createSymlink
      ? symlink(
          join(__dirname, '..', 'src', '@ac'),
          join(__dirname, '..', 'node_modules', '@ac'),
          'dir'
        )
      : null
  ]);

  console.log('done');
})().catch(e => {
  console.error('fucky wucky', e);
});