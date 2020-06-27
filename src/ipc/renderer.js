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
    throw new Error('Not implemented');
  },

  /**
   * Closes DevTools for the current window
   */
  closeDevTools () {
    throw new Error('Not implemented');
  }
};
