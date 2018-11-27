// Loosely based on ED/DI injector

const { BrowserWindow, app, session } = require('electron');
const { join, dirname } = require('path');

class PatchedBrowserWindow extends BrowserWindow {
  constructor (opts) {
    if (opts.webPreferences && opts.webPreferences.preload) {
      global.originalPreload = opts.webPreferences.preload;
      opts.webPreferences.preload = join(__dirname, 'preload');
      opts.webPreferences.nodeIntegration = true;
    }

    return new BrowserWindow(opts);
  }
}

app.on('ready', () => {
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  const electronCacheEntry = require.cache[require.resolve('electron')];
  Object.defineProperty(electronCacheEntry, 'exports', {
    value: {
      ...electronCacheEntry.exports
    }
  });
  electronCacheEntry.exports.BrowserWindow = PatchedBrowserWindow;

  const discordPath = join(dirname(require.main.filename), '..', 'app.asar');

  require('module')
    ._load(
      join(
        discordPath,
        require(join(discordPath, 'package.json')).main
      ),
      null, true
    );
});
