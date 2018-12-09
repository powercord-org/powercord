// Based off of BBD injector

const Module = require('module');
const { join, dirname, resolve } = require('path');
const electron = require('electron');
const { BrowserWindow, app, session } = electron;

const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');

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

electron.app.once('ready', () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  Object.assign(PatchedBrowserWindow, electron.BrowserWindow);
  require.cache[electronPath].exports = Object.assign({}, electron, {
    BrowserWindow: PatchedBrowserWindow
  });
});

const discordPackage = require(join(discordPath, 'package.json'));

electron.app.setAppPath(discordPath);
electron.app.setName(discordPackage.name);

Module._load(
  join(discordPath, discordPackage.main),
  null,
  true
);
