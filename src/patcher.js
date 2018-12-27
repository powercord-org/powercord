const Module = require('module');
const { join, dirname } = require('path');
const electron = require('electron');
const { BrowserWindow, app, session } = electron;

const electronPath = require.resolve('electron');
const discordPath = join(dirname(require.main.filename), '..', 'app.asar');

class PatchedBrowserWindow extends BrowserWindow {
  // noinspection JSAnnotator - Make JetBrains happy
  constructor (opts) {
    if (opts.webPreferences && opts.webPreferences.preload) {
      global.originalPreload = opts.webPreferences.preload;
      opts.webPreferences.preload = join(__dirname, 'preload.js');
      opts.webPreferences.nodeIntegration = true;
    }

    return new BrowserWindow(opts);
  }
}

Object.assign(PatchedBrowserWindow, electron.BrowserWindow);
require.cache[electronPath].exports = {};

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
  session.defaultSession.webRequest.onHeadersReceived(({ responseHeaders }, done) => {
    Object.keys(responseHeaders)
      .filter(k => (/^content-security-policy/i).test(k))
      .map(k => (delete responseHeaders[k]));

    done({ responseHeaders });
  });

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
