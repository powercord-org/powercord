/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

require('../polyfills');

const { ipcRenderer, webFrame } = require('electron');
const { join } = require('path');
const { existsSync, mkdirSync, open, write } = require('fs');
const { LOGS_FOLDER } = require('./fake_node_modules/powercord/constants');
require('./ipc/renderer');

// --
// Begin some catastrophically stupid shit to make Powercord survive with context isolation
// --

class BetterResizeObserver extends ResizeObserver {
  constructor (fn) {
    super((...args) => fn(...args));
  }
}

class BetterMutationObserver extends MutationObserver {
  constructor (fn) {
    super((...args) => fn(...args));
  }
}

Object.defineProperty(window, 'ResizeObserver', { get: () => BetterResizeObserver });
Object.defineProperty(window, 'MutationObserver', { get: () => BetterMutationObserver });

Object.defineProperty(window, 'webpackJsonp', {
  get: () => webFrame.top.context.window.webpackJsonp
});

Object.defineProperty(window, 'GLOBAL_ENV', {
  get: () => webFrame.top.context.window.GLOBAL_ENV
});

Object.defineProperty(window, 'DiscordSentry', {
  get: () => webFrame.top.context.window.DiscordSentry
});

Object.defineProperty(window, '__SENTRY__', {
  get: () => webFrame.top.context.window.__SENTRY__
});

Object.defineProperty(window, '_', {
  get: () => webFrame.top.context.window._
});

Object.defineProperty(window, 'platform', {
  get: () => webFrame.top.context.window.platform
});

const realQuerySelector = document.querySelector.bind(document);
const realQuerySelectorAll = document.querySelectorAll.bind(document);

let pointer = 0;
function fetchInternal () {
  this.dataset.powercordReactInstancePointer = ++pointer;
  const realNode = webFrame.top.context.document.querySelector(`[data-powercord-react-instance-pointer="${pointer}"]`);
  realNode.removeAttribute('data-powercord-react-instance-pointer');
  const key = Object.keys(realNode).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
  this.__reactInternalInstance$ = realNode[key];
  this.__reactFiber$ = realNode[key];

  return realNode[key];
}

function wrapElement (node) {
  if (node && !node.__reactInternalInstance$) {
    node.__reactInternalInstance$ = null;
    node.__reactFiber$ = null;
    Object.defineProperty(node, '__reactInternalInstance$', {
      get: fetchInternal,
      configurable: true
    });
    Object.defineProperty(node, '__reactFiber$', {
      get: fetchInternal,
      configurable: true
    });
  }
}

document.querySelector = (q) => {
  const node = realQuerySelector(q);
  wrapElement(node);
  return node;
};

document.querySelectorAll = (q) => {
  const nodes = Array.from(realQuerySelectorAll(q));
  nodes.forEach((node) => wrapElement(node));
  return nodes;
};

// --
// I am not responsible for the rapid decease in the amount of alive brain previous code may have caused
// --

console.log('[Powercord] Loading Powercord');

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
const preload = ipcRenderer.sendSync('POWERCORD_GET_PRELOAD');
if (preload) {
  require(preload);
}

// Debug logging
let debugLogs = false;
try {
  const settings = require('../settings/pc-general.json');
  // eslint-disable-next-line prefer-destructuring
  debugLogs = settings.debugLogs;
} catch (e) {}

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
      const ogFunction = webFrame.top.context.console[key].bind(console);
      webFrame.top.context.console[key] = (...args) => {
        const cleaned = [];
        for (let i = 0; i < args.length; i++) {
          const part = args[i];
          if (typeof part === 'string' && part.includes('%c')) { // Remove console formatting
            cleaned.push(part.replace(/%c/g, ''));
            i++;
          } else if (part instanceof Error) { // Errors
            cleaned.push(part.message);
          } else if (typeof part === 'object') { // Objects
            cleaned.push(JSON.stringify(part));
          } else {
            cleaned.push(part);
          }
        }
        write(fd, `[${getDate()}] [CONSOLE] [${levels[key]}] ${cleaned.join(' ')}\n`, 'utf8', () => void 0);
        ogFunction.call(webFrame.top.context.console, ...args);
      };
    }

    // Add listeners
    process.on('uncaughtException', ev => write(fd, `[${getDate()}] [PROCESS] [ERROR] Uncaught Exception: ${ev.error}\n`, 'utf8', () => void 0));
    process.on('unhandledRejection', ev => write(fd, `[${getDate()}] [PROCESS] [ERROR] Unhandled Rejection: ${ev.reason}\n`, 'utf8', () => void 0));
    window.addEventListener('error', ev => write(fd, `[${getDate()}] [WINDOW] [ERROR] ${ev.error}\n`, 'utf8', () => void 0));
    window.addEventListener('unhandledRejection', ev => write(fd, `[${getDate()}] [WINDOW] [ERROR] Unhandled Rejection: ${ev.reason}\n`, 'utf8', () => void 0));
  });
}

// Overlay devtools
powercord.once('loaded', () => {
  if (window.__OVERLAY__ && powercord.api.settings.store.getSetting('pc-general', 'openOverlayDevTools', false)) {
    PowercordNative.openDevTools({}, true);
  }
});
