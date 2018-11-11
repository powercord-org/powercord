const { readdir, mkdir, writeFile } = require('fs').promises;
const { join } = require('path');

(async () => {
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

  await Promise.all([
    writeFile(
      join(appDir, 'index.js'),
      `require('${join(__dirname, '..', 'src', 'patcher.js').replace(/\\/g, '\\\\')}')`
    ),
    writeFile(
      join(appDir, 'package.json'),
      JSON.stringify({ main: 'index.js' })
    )
  ]);

  console.log('done');
})().catch(e => {
  console.error('fucky wucky', e);
});