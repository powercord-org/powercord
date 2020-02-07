/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/* global appSettings */
const Module = require('module');
const { join, dirname, resolve } = require('path');
const electron = require('electron');
const { BrowserWindow, app, session } = electron;

const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');

let settings;
try {
  settings = require(resolve(__dirname, '..', 'settings', 'pc-general.json'));
} catch (err) {
  settings = {};
}

const { transparentWindow, experimentalWebPlatform } = settings;

class PatchedBrowserWindow extends BrowserWindow {
  // noinspection JSAnnotator - Make JetBrains happy
  constructor (opts) {
    if (opts.webContents) {
      // Go Live (general purpose?) popout. Might be interesting to investigate how it works as it has very low startup latency.
    } else if (opts.webPreferences && opts.webPreferences.nodeIntegration) {
      // Splash Screen
    } else if (opts.webPreferences && opts.webPreferences.offscreen) {
      // Overlay
      global.originalPreload = opts.webPreferences.preload;
      opts.webPreferences.preload = join(__dirname, 'preload.js');
      opts.webPreferences.nodeIntegration = true;
    } else if (opts.webPreferences && opts.webPreferences.preload) {
      // Discord Client
      global.originalPreload = opts.webPreferences.preload;
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

    return new BrowserWindow(opts);
  }
}

Object.assign(PatchedBrowserWindow, electron.BrowserWindow);

delete require.cache[electronPath].exports;
require.cache[electronPath].exports = {
  deprecate: electron.deprecate,
  BrowserWindow: PatchedBrowserWindow
};

const failedExports = [];
for (const prop in electron) {
  if (prop === 'BrowserWindow') {
    continue;
  }

  try {
    // noinspection JSUnfilteredForInLoop
    Object.defineProperty(require.cache[electronPath].exports, prop, {
      get () {
        // noinspection JSUnfilteredForInLoop
        return electron[prop];
      }
    });
  } catch (_) {
    // noinspection JSUnfilteredForInLoop
    failedExports.push(prop);
  }
}

app.once('ready', () => {
  require.cache[electronPath].exports.BrowserWindow = PatchedBrowserWindow;

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
    } else if (details.url.startsWith('https://canary.discordapp.com/_powercord')) {
      appSettings.set('_POWERCORD_ROUTE', details.url.replace('https://canary.discordapp.com', ''));
      appSettings.save();
      // It should get restored to _powercord url later
      done({ redirectURL: 'https://canary.discordapp.com/app' });
    } else {
      done({});
    }
  });

  for (const prop of failedExports) {
    require.cache[electronPath].exports[prop] = electron[prop];
  }
});

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
  electron.app.setName(discordPackage.name);

  Module._load(
    join(discordPath, discordPackage.main),
    null,
    true
  );
})();
