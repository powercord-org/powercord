/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const Module = require('module');
const { join, dirname } = require('path');
const { existsSync, unlinkSync } = require('fs');
const electron = require('electron');
const PatchedBrowserWindow = require('./browserWindow');
require('./updater');
require('./ipc/main');

const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');

// Restore the classic path; The updater relies on it and it makes Discord go corrupt
require.main.filename = join(discordPath, 'app_bootstrap/index.js');

console.log('Hello from Powercord!');

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

electron.app.once('ready', () => {
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k) || (/^x-frame-options/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  // @todo: make this be not shit
  electron.session.defaultSession.webRequest.onBeforeRequest((details, done) => {
    if (details.url.startsWith('https://canary.discordapp.com/_powercord')) {
      // It should get restored to _powercord url later
      done({ redirectURL: 'https://canary.discordapp.com/app' });
    } else {
      done({});
    }
  });
});

const discordPackage = require(join(discordPath, 'package.json'));
electron.app.setAppPath(discordPath);
electron.app.name = discordPackage.name;

/**
 * Fix DevTools extensions for wintards
 * Keep in mind that this rather treats the symptom
 * than fixing the root issue.
 * @see https://github.com/electron/electron/issues/19468
 */
if (process.platform === 'win32') {
  setImmediate(() => { // WTF: the app name doesn't get set instantly?
    const devToolsExtensions = join(electron.app.getPath('userData'), 'DevTools Extensions');

    if (existsSync(devToolsExtensions)) {
      unlinkSync(devToolsExtensions);
    }
  });
}

// Load Discord
console.log('Loading Discord');
Module._load(join(discordPath, discordPackage.main), null, true);
