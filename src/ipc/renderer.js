/* eslint-disable no-unused-vars */

const { ipcRenderer } = require('electron');

if (!ipcRenderer) {
  throw new Error('Don\'t require stuff you shouldn\'t silly.');
}

global.PowercordNative = {
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
   * Installs a chrome extension
   * @param {string} extPath Path to the extension
   * @returns {Promise<string>} Extension ID, to be used with uninstallExtension.
   */
  installExtension (extPath) { // tbd
    return ipcRenderer.invoke('POWERCORD_INSTALL_EXTENSION', extPath);
  },

  /**
   * Uninstalls an extension
   * @param {string} extId Extension ID
   * @returns {Promise<void>}
   */
  uninstallExtension (extId) { // tbd
    return ipcRenderer.invoke('POWERCORD_UNINSTALL_EXTENSION', extId);
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
  }
};
