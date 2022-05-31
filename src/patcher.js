const Module = require('module');
const { join, dirname } = require('path');
const { existsSync, unlinkSync } = require('fs');

// Restore the classic path; The updater relies on it and it makes Discord go corrupt
const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');
require.main.filename = join(discordPath, 'app_bootstrap/index.js');

const electron = require('electron');
const PatchedBrowserWindow = require('./browserWindow');

require('./ipc/main');

console.log('Hello from Powercord!');

let _patched = false;
const appSetAppUserModelId = electron.app.setAppUserModelId;
function setAppUserModelId (...args) {
  /*
   * once this has been called, we can assume squirrelUpdate is safe to require
   * as everything that needs to be initialized has been initialized
   * see: https://github.com/powercord-org/powercord/issues/405
   * see: https://github.com/powercord-org/powercord/issues/382
   */

  appSetAppUserModelId.apply(this, args);
  if (!_patched) {
    _patched = true;
    require('./updater.win32');
  }
}

electron.app.setAppUserModelId = setAppUserModelId;

if (!electron.safeStorage) {
  electron.safeStorage = {
    isEncryptionAvailable: () => false,
    encryptString: () => {
      throw new Error('Unavailable');
    },
    decryptString: () => {
      throw new Error('Unavailable');
    }
  };
}

const electronExports = new Proxy(electron, {
  get (target, prop) {
    switch (prop) {
      case 'BrowserWindow': return PatchedBrowserWindow;

      // Trick Babel's polyfill thing into not touching Electron's exported object with its logic
      case 'default': return electronExports;
      case '__esModule': return true;
      default: return target[prop];
    }
  }
});

delete require.cache[electronPath].exports;
require.cache[electronPath].exports = electronExports;

electron.app.once('ready', () => {
  // @todo: Whitelist a few domains instead of removing CSP altogether; See #386
  electron.session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

  // @todo: make this be not shit
  electron.session.defaultSession.webRequest.onBeforeRequest((details, done) => {
    const domainMatch = details.url.match(/^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com/);
    if (domainMatch) {
      const domain = domainMatch[0];
      if (details.url.startsWith(`${domain}/_powercord`)) {
      // It should get restored to _powercord url later
        done({ redirectURL: `${domain}/app` });
      } else {
        done({});
      }
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
  // todo: define if this is still necessary
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
