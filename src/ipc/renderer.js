/* eslint-disable no-unused-vars */

const { ipcRenderer } = require('electron');

if (!ipcRenderer) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

global.PowercordNative = {
  openBrowserWindow (opts) {
    throw new Error('Not implemented');
  },

  installExtension () { // tbd
    throw new Error('Not implemented');
  },

  /**
   * Open DevTools for the current window
   * @param {object} opts Options to pass to Electron
   * @param {boolean} externalWindow Whether the DevTools should be opened in an external window or not.
   */
  openDevTools (opts, externalWindow) {
    ipcRenderer.send('POWERCORD_OPEN_DEVTOOLS', opts, externalWindow);
  },

  /**
   * Closes DevTools for the current window
   */
  closeDevTools () {
    ipcRenderer.send('POWERCORD_CLOSE_DEVTOOLS');
  },

  /**
   * Clears Chromium's cache
   * @returns {Promise<void>}
   */
  clearCache () {
    return ipcRenderer.invoke('POWERCORD_CACHE_CLEAR');
  }
};
