const { existsSync } = require('fs');
const { readdir, lstat, unlink, rmdir } = require('fs').promises;

const rmdirRf = async (path) => {
  if (existsSync(path)) {
    const files = await readdir(path);
    for (const file of files) {
      const curPath = `${path}/${file}`;
      const stat = await lstat(curPath);

      if (stat.isDirectory()) {
        await rmdirRf(curPath);
      } else {
        await unlink(curPath);
      }
    }
    await rmdir(path);
  }
};

module.exports = rmdirRf;
