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

window.ResizeObserver = BetterResizeObserver;
window.MutationObserver = BetterMutationObserver;

function rebindAllEventTargets () {
  function rebindEventTarget (target) {
    const realAddEventListener = target.addEventListener;
    const realRemoveEventListener = target.removeEventListener;

    target.addEventListener = function (type, fn, ...args) {
      this.__listenerStore = this.__listenerStore || new Map();
      if (!this.__listenerStore.has(type)) {
        this.__listenerStore.set(type, new WeakMap());
      }

      function listener (...args) {
        fn.apply(this, args);
      }

      this.__listenerStore.get(type).set(fn, listener);
      realAddEventListener.call(this, type, listener, ...args);
    };

    target.removeEventListener = function (type, fn, ...args) {
      this.__listenerStore = this.__listenerStore || new Map();
      if (!this.__listenerStore.has(type)) {
        this.__listenerStore.set(type, new WeakMap());
      }

      const map = this.__listenerStore.get(type);
      const listener = map.get(fn);
      realRemoveEventListener.call(this, type, listener, ...args);
      map.delete(fn);
    };
  }

  rebindEventTarget(window);
  rebindEventTarget(document);
  rebindEventTarget(Element.prototype);
}

rebindAllEventTargets();
webFrame.executeJavaScript(`(${rebindAllEventTargets.toString().replace('rebindAllEventTargets', '')}())`);

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

let pointer = 0;
function fetchRealElement (element) {
  element.dataset.powercordReactInstancePointer = ++pointer;
  const realNode = webFrame.top.context.document.querySelector(`[data-powercord-react-instance-pointer="${pointer}"]`);
  realNode.removeAttribute('data-powercord-react-instance-pointer');
  return realNode
}

function fetchInternal () {
  const realNode = fetchRealElement(this);
  const key = Object.keys(realNode).find(key => key.startsWith('__reactInternalInstance') || key.startsWith('__reactFiber'));
  this.__reactInternalInstance$ = realNode[key];
  this.__reactFiber$ = realNode[key];

  return realNode[key];
}

function fetchInternalRoot () {
  const realNode = fetchRealElement(this);
  this._reactRootContainer = realNode._reactRootContainer;
  return realNode._reactRootContainer;
}

function wrapElement (node) {
  if (node) {
    if (node.id === 'app-mount' && !node._reactRootContainer) {
      node._reactRootContainer = null;
      Object.defineProperty(node, '_reactRootContainer', {
        get: fetchInternalRoot,
        configurable: true
      });
    } else if (node.id !== 'app-mount' && !node.__reactInternalInstance$) {
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
}

const getFunctions = [
  [ 'querySelector', false ],
  [ 'querySelectorAll', true ],
  [ 'getElementById', false ],
  [ 'getElementByClassName', true ],
  [ 'getElementByName', true ],
  [ 'getElementsByTagName', true ],
  [ 'getElementsByTagNameNS', true ]
]

for (const [ getMethod, isCollection ] of getFunctions) {
  const realGetter = document[getMethod].bind(document);
  if (isCollection) {
    document[getMethod] = (...args) => {
      const nodes = Array.from(realGetter(...args));
      nodes.forEach((node) => wrapElement(node));
      return nodes;
    }
  } else {
    document[getMethod] = (...args) => {
      const node = realGetter(...args);
      wrapElement(node);
      return node;
    }
  }
}

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
