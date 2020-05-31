require('../polyfills');

const { remote } = require('electron');
const { join } = require('path');
const { existsSync, mkdirSync, open, write } = require('fs');
const { LOGS_FOLDER } = require('./fake_node_modules/powercord/constants');

// Add Powercord's modules
require('module').Module.globalPaths.push(join(__dirname, 'fake_node_modules'));

// Initialize Powercord
const Powercord = require('./Powercord');
global.powercord = new Powercord();

// https://github.com/electron/electron/issues/9047
if (process.platform === 'darwin' && !process.env.PATH.includes('/usr/local/bin')) {
  process.env.PATH += ':/usr/local/bin';
}

// Discord's preload
require(remote.getGlobal('originalPreload'));

// Debug logging
let debugLogs;
try {
  const settings = require('../settings/pc-general.json');
  // eslint-disable-next-line prefer-destructuring
  debugLogs = settings.debugLogs;
} finally {
  if (debugLogs) {
    if (!existsSync(LOGS_FOLDER)) {
      mkdirSync(LOGS_FOLDER, { recursive: true });
    }
    const getDate = () => new Date().toISOString().replace('T', ' ').split('.')[0];
    const filename = `${window.__OVERLAY__ ? 'overlay' : 'discord'}-${new Date().toISOString().replace('T', '_').replace(/:/g, '-').split('.')[0]}.txt`;
    const path = join(LOGS_FOLDER, filename);
    console.log('[Powercord] Debug logs enabled. Logs will be saved in', path);
    open(path, 'w', (_, fd) => {
      // Patch console methods
      const levels = {
        debug: 'DEBUG',
        log: 'INFO',
        info: 'INFO',
        warn: 'WARN',
        error: 'ERROR'
      };
      for (const key of Object.keys(levels)) {
        const ogFunction = console[key].bind(console);
        console[key] = (...args) => {
          const cleaned = [];
          for (let i = 0; i < args.length; i++) {
            const part = args[i];
            if (typeof part === 'string' && part.includes('%c')) { // Remove console formatting
              cleaned.push(part.replace(/%c/g, ''));
              i++;
            } else if (part instanceof Error) { // Objects
              cleaned.push(part.message);
            } else if (typeof part === 'object') { // Objects
              cleaned.push(JSON.stringify(part));
            } else {
              cleaned.push(part);
            }
          }
          write(fd, `[${getDate()}] [CONSOLE] [${levels[key]}] ${cleaned.join(' ')}\n`, 'utf8', () => void 0);
          ogFunction.call(console, ...args);
        };
      }

      // Add listeners
      process.on('uncaughtException', ev => write(fd, `[${getDate()}] [PROCESS] [ERROR] Uncaught Exception: ${ev.error}\n`, 'utf8', () => void 0));
      process.on('unhandledRejection', ev => write(fd, `[${getDate()}] [PROCESS] [ERROR] Unhandled Rejection: ${ev.reason}\n`, 'utf8', () => void 0));
      window.addEventListener('error', ev => write(fd, `[${getDate()}] [WINDOW] [ERROR] ${ev.error}\n`, 'utf8', () => void 0));
      window.addEventListener('unhandledRejection', ev => write(fd, `[${getDate()}] [WINDOW] [ERROR] Unhandled Rejection: ${ev.reason}\n`, 'utf8', () => void 0));
    });
  }
}

// Overlay devtools
powercord.once('loaded', () => {
  if (window.__OVERLAY__ && powercord.api.settings.store.getSetting('pc-general', 'openOverlayDevTools', false)) {
    const overlayWindow = remote.getCurrentWindow();
    overlayWindow.openDevTools({ mode: 'detach' });
    let devToolsWindow = new remote.BrowserWindow({
      webContents: overlayWindow.devToolsWebContents
    });
    devToolsWindow.on('ready-to-show', () => {
      devToolsWindow.show();
    });
    devToolsWindow.on('close', () => {
      overlayWindow.closeDevTools();
      devToolsWindow = null;
    });
  }
});
