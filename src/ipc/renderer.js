/* eslint-disable no-unused-vars */

const { ipcRenderer, webFrame } = require('electron');

if (!ipcRenderer) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

global.powercordNative = {
  /**
   * Open DevTools for the current window
   * @param {object} opts Options to pass to Electron
   * @param {boolean} externalWindow Whether the DevTools should be opened in an external window or not.
   */
  openDevTools (opts, externalWindow) {
    return ipcRenderer.invoke('POWERCORD_OPEN_DEVTOOLS', opts, externalWindow);
  },

  /**
   * Closes DevTools for the current window
   */
  closeDevTools () {
    return ipcRenderer.invoke('POWERCORD_CLOSE_DEVTOOLS');
  },

  /**
   * Clears Chromium's cache
   * @returns {Promise<void>}
   */
  clearCache () {
    return ipcRenderer.invoke('POWERCORD_CACHE_CLEAR');
  },

  openBrowserWindow (opts) {
    throw new Error('Not implemented');
  },

  __compileSass (file) {
    return ipcRenderer.invoke('POWERCORD_COMPILE_MF_SASS', file);
  },

  exec (...args) {
    return ipcRenderer.invoke('POWERCORD_EXEC_COMMAND', ...args);
  }
};

if (!window.__SPLASH__) {
  window.require = function (mdl) {
    switch (mdl) {
      case 'powercord/compilers':
      case 'powercord/components':
      case 'powercord/components/settings':
      case 'powercord/http':
      case 'powercord/injector':
      case 'powercord/util':
      case 'powercord/webpack':
      case 'powercord/constants':
      case 'powercord/modal':
      case 'powercord':
      case 'electron':
        return require(mdl);
      default:
        throw new Error('Unknown module');
    }
  };
}
