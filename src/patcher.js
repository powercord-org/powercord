// Loosely based on ED/DI injector

const { BrowserWindow, app } = require('electron');
const { join, dirname } = require('path');

class PatchedBrowserWindow extends BrowserWindow {
  constructor (opts) {
    if (opts.webPreferences && opts.webPreferences.preload) {
      process.env.originalPreload = opts.webPreferences.preload
      opts.webPreferences.preload = join(__dirname, 'preload');
      opts.webPreferences.nodeIntegration = true;
    }

    return new BrowserWindow(opts);
  }
}

app.on('ready', () => {
  const electronCacheEntry = require.cache[require.resolve('electron')];
  Object.defineProperty(electronCacheEntry, 'exports', {
    value: {
      ...electronCacheEntry.exports
    }
  });
  electronCacheEntry.exports.BrowserWindow = PatchedBrowserWindow;

  const discordPath = join(dirname(require.main.filename), '..', 'app.asar')
  
  require('module')
    ._load(
      join(
        discordPath,
        require(join(discordPath, 'package.json')).main
      ),
      null, true
    );
});
