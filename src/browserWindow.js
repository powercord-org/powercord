/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { join } = require('path');
const { BrowserWindow } = require('electron');

let settings = {};
let transparency = false;
let ewp = false;
try {
  settings = require(join(__dirname, '../../settings/pc-general.json'));
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
      // Discord Client
      originalPreload = opts.webPreferences.preload;
      opts.webPreferences.preload = join(__dirname, './preload.js');
      opts.webPreferences.contextIsolation = false;

      if (transparency) {
        opts.transparent = true;
        opts.frame = process.platform === 'win32' ? false : opts.frame;
        delete opts.backgroundColor;
      }

      if (ewp) {
        opts.webPreferences.experimentalFeatures = true;
      }
    }

    // @todo: get rid of this. see #337
    opts.webPreferences.enableRemoteModule = true;
    const win = new BrowserWindow(opts);
    const ogLoadUrl = win.loadURL.bind(win);
    Object.defineProperty(win, 'loadURL', {
      get: () => PatchedBrowserWindow.loadUrl.bind(win, ogLoadUrl),
      configurable: true
    });

    win.webContents._powercordPreload = originalPreload;
    return win;
  }

  static loadUrl (ogLoadUrl, url, opts) {
    console.log(url);
    if (url.match(/^https:\/\/canary\.discord(app)?\.com\/_powercord\//)) {
      this.webContents._powercordOgUrl = url;
      return ogLoadUrl('https://canary.discordapp.com/app', opts);
    }
    return ogLoadUrl(url, opts);
  }
}

module.exports = PatchedBrowserWindow;
