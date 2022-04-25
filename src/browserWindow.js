const { join } = require('path');
const { BrowserWindow } = require('electron');

let settings = {};
let transparency = false;
let ewp = false;
try {
  settings = require(join(__dirname, '../settings/pc-general.json'));
  transparency = settings.transparentWindow;
  ewp = settings.experimentalWebPlatform;
} catch (e) {}

class PatchedBrowserWindow extends BrowserWindow {
  // noinspection JSAnnotator - Make JetBrains happy
  constructor (opts) {
    let originalPreload;
    if (opts.webContents) {
      // General purpose popouts used by Discord
    } else if (opts.webPreferences && opts.webPreferences.nodeIntegration) {
      // Splash Screen
      opts.webPreferences.preload = join(__dirname, './preloadSplash.js');
    } else if (opts.webPreferences && opts.webPreferences.offscreen) {
      // Overlay
      originalPreload = opts.webPreferences.preload;
      // opts.webPreferences.preload = join(__dirname, './preload.js');
    } else if (opts.webPreferences && opts.webPreferences.preload) {
      originalPreload = opts.webPreferences.preload;
      if (opts.webPreferences.nativeWindowOpen) {
        // Discord Client
        opts.webPreferences.preload = join(__dirname, './preload.js');
        opts.webPreferences.contextIsolation = false; // shrug
      } else {
        // Splash Screen on macOS (Host 0.0.262+) & Windows (Host 0.0.293 / 1.0.17+)
        opts.webPreferences.preload = join(__dirname, './preloadSplash.js');
      }

      if (transparency) {
        opts.transparent = true;
        opts.frame = process.platform === 'win32' ? false : opts.frame;
        delete opts.backgroundColor;
      }

      if (ewp) {
        opts.webPreferences.experimentalFeatures = true;
      }
    }

    const win = new BrowserWindow(opts);
    const ogLoadUrl = win.loadURL.bind(win);
    Object.defineProperty(win, 'loadURL', {
      get: () => PatchedBrowserWindow.loadUrl.bind(win, ogLoadUrl),
      configurable: true
    });

    win.on('maximize', () => void win.webContents.send('POWERCORD_WINDOW_MAXIMIZE'));
    win.on('unmaximize', () => void win.webContents.send('POWERCORD_WINDOW_UNMAXIMIZE'));

    win.webContents._powercordPreload = originalPreload;
    return win;
  }

  static loadUrl (ogLoadUrl, url, opts) {
    let match = url.match(/^https:\/\/((?:canary|ptb)\.)?discord(app)?\.com\/_powercord\//);
    if (match) {
      this.webContents._powercordOgUrl = url;
      return ogLoadUrl(`https://${match[1] || ''}discord.com/app`, opts);
    }
    return ogLoadUrl(url, opts);
  }
}

module.exports = PatchedBrowserWindow;
