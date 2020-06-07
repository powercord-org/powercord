/* global appSettings */
const Module = require('module');
const { join, dirname, resolve } = require('path');
const { existsSync, unlinkSync, writeFileSync } = require('fs');
const electron = require('electron');
const { BrowserWindow, app, session, ipcMain } = electron;

const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');

console.log('Hello from Powercord!');

/**
 * Glasscord compatibility fix for legacy installs
 * This is a temporary fix and will be removed on July 1st, 2020.
 * Some cases might require just re-plugging Powercord, this isn't a perfect solution
 * @see https://github.com/powercord-org/powercord/issues/316
 */
const _pkgFile = join(dirname(require.main.filename), 'package.json');
const _pkg = require(_pkgFile);
if (!_pkg.name) {
  try {
    writeFileSync(_pkgFile, JSON.stringify({
      ..._pkg,
      name: 'discord'
    }));
  } catch (e) {
    // Most likely a perm issue. Let's fail silently on that one
  }
}

let settings;
try {
  settings = require(resolve(__dirname, '..', 'settings', 'pc-general.json'));
} catch (err) {
  settings = {};
}
const { transparentWindow, experimentalWebPlatform } = settings;

let originalPreload;

class PatchedBrowserWindow extends BrowserWindow {
  // noinspection JSAnnotator - Make JetBrains happy
  constructor (opts) {
    console.log(opts);
    if (opts.webContents) {
      // General purpose popouts used by Discord
    } else if (opts.webPreferences && opts.webPreferences.nodeIntegration) {
      // Splash Screen
      opts.webPreferences.preload = join(__dirname, 'preloadSplash.js');
    } else if (opts.webPreferences && opts.webPreferences.offscreen) {
      // Overlay
      originalPreload = opts.webPreferences.preload;
      opts.webPreferences.preload = join(__dirname, 'preload.js');
      opts.webPreferences.nodeIntegration = true;
    } else if (opts.webPreferences && opts.webPreferences.preload) {
      // Discord Client
      originalPreload = opts.webPreferences.preload;
      opts.webPreferences.preload = join(__dirname, 'preload.js');
      opts.webPreferences.nodeIntegration = true;

      if (transparentWindow) {
        opts.transparent = true;
        opts.frame = false;
        delete opts.backgroundColor;
      }

      if (experimentalWebPlatform) {
        opts.webPreferences.experimentalFeatures = true;
      }
    }

    opts.webPreferences.enableRemoteModule = true;
    return new BrowserWindow(opts);
  }
}


const electronExports = new Proxy(electron, {
  get (target, prop) {
    switch (prop) {
      case 'BrowserWindow': return PatchedBrowserWindow;
      default: return target[prop];
    }
  }
});

delete require.cache[electronPath].exports;
require.cache[electronPath].exports = electronExports;

app.once('ready', () => {
  // headers must die
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    /*
     * To people worried about security: those protection headers removal do *not* cause security issues.
     *
     * In a vanilla Discord it would actually lower the security level of the app, but with Powercord installed
     * this is another story. Node integration is available within the render process, meaning scrips can do requests
     * using native http module (bypassing content-security-policy), and could use BrowserViews to mimic the behaviour
     * of an iframe (bypassing the x-frame-options header). So we decided, for convenience, to drop them entirely.
     */
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k) || (/^x-frame-options/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  // source maps must die
  session.defaultSession.webRequest.onBeforeRequest((details, done) => {
    if (details.url.endsWith('.js.map')) {
      // source maps must die
      done({ cancel: true });
    } else if (details.url.startsWith('https://canary.discordapp.com/_powercord')) { // @todo: discord.com
      appSettings.set('_POWERCORD_ROUTE', details.url.replace('https://canary.discordapp.com', ''));
      appSettings.save();
      // It should get restored to _powercord url later
      done({ redirectURL: 'https://canary.discordapp.com/app' });
    } else {
      done({});
    }
  });
});


// #region IPC

// TODO(TTtie): Move this into another module
ipcMain.on('pc-getPreload', (ev) => ev.returnValue = originalPreload);
ipcMain.handle('pc-openDevTools', (ev, isOverlay) => {
  if (isOverlay) {
    ev.sender.openDevTools({ mode: 'detach' });
    let devToolsWindow = new BrowserWindow({
      webContents: ev.sender.devToolsWebContents
    });
    devToolsWindow.on('ready-to-show', () => {
      devToolsWindow.show();
    });
    devToolsWindow.on('close', () => {
      ev.sender.closeDevTools();
      devToolsWindow = null;
    });
  } else {
    ev.sender.openDevTools();
  }
});
ipcMain.handle('pc-sendInputEvent', (ev, data) => {
  ev.sender.sendInputEvent(data);
});
// #endregion IPC

(async () => {
  if (process.argv[1] === '--squirrel-obsolete') {
    /**
     * @todo: Make this actually be working
     * After further testing it looks like this is only called
     * for versions that are way older (if new ver is 4, ver 2 will be
     * called but not ver 3).
     */
    const main = require('../injectors/main.js');
    const platform = require(`../injectors/${process.platform}.js`);
    await main.inject(platform);
  }
  const discordPackage = require(join(discordPath, 'package.json'));

  electron.app.setAppPath(discordPath);
  electron.app.name = discordPackage.name;

  /**
   * Fix DevTools extensions for wintards
   * Keep in mind that this rather treats the symptom
   * than fixing the root issue.
   */
  if (process.platform === 'win32') {
    setImmediate(() => { // WTF: the app name doesn't get set instantly?
      const devToolsExtensions = join(electron.app.getPath('userData'), 'DevTools Extensions');

      if (existsSync(devToolsExtensions)) {
        unlinkSync(devToolsExtensions);
      }
    });
  }

  console.log('Loading Discord');
  Module._load(
    join(discordPath, discordPackage.main),
    null,
    true
  );
})();
