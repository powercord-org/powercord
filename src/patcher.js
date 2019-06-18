/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
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
    if (opts.webPreferences && opts.webPreferences.preload) {
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
electron.deprecate.promisify = ((dep) => (fn) => fn ? dep(fn) : (() => void 0))(electron.deprecate.promisify);

require.cache[electronPath].exports = {
  /*
   * TODO: Thoroughly investigate every Electron export
   * and see which ones are dependent on each other
   * to prevent having to "whitelist" modules on
   * a cat-and-mouse basis
   */
  deprecate: electron.deprecate
};

const failedExports = [];
for (const prop in electron) {
  try {
    // noinspection JSUnfilteredForInLoop
    require.cache[electronPath].exports[prop] = electron[prop];
  } catch (_) {
    // noinspection JSUnfilteredForInLoop
    failedExports.push(prop);
  }
}

require.cache[electronPath].exports.BrowserWindow = PatchedBrowserWindow;

app.once('ready', () => {
  session.defaultSession.webRequest.onBeforeRequest({
    urls: [ 'https://canary.discordapp.com/_powercord/*' ]
  }, (details, done) => {
    appSettings.set('_POWERCORD_ROUTE', details.url);
    appSettings.save();
    // @todo: Redirect to the last classic route saved
    done({ redirectURL: 'https://canary.discordapp.com/app' });
  });

  // csp must die
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  // source maps must die
  // session.defaultSession.webRequest.onBeforeRequest((details, done) =>
  //   done({ cancel: details.url.endsWith('.js.map') })
  // );

  for (const prop of failedExports) {
    require.cache[electronPath].exports[prop] = electron[prop];
  }
});

const discordPackage = require(join(discordPath, 'package.json'));

electron.app.setAppPath(discordPath);
electron.app.setName(discordPackage.name);

Module._load(
  join(discordPath, discordPackage.main),
  null,
  true
);
