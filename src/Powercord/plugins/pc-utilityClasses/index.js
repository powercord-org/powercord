const { remote } = require('electron');
const { Plugin } = require('powercord/entities');
const modules = require('./modules');

module.exports = class UtilityClasses extends Plugin {
  startPlugin () {
    this.callbacks = [];
    Object.values(modules).forEach(async mod => {
      const callback = await mod();
      if (typeof callback === 'function') {
        this.callbacks.push(callback);
      }
    });

    document.body.classList.add('powercord');
    if (window.__OVERLAY__) {
      document.body.classList.add('overlay');
    }
    const webPrefs = remote.getCurrentWebContents().getWebPreferences();
    if (webPrefs.transparent) {
      document.body.classList.add('transparent');
    }
    if (webPrefs.experimentalFeatures) {
      document.body.classList.add('experimental-web-features');
    }
    const date = new Date();
    if (date.getMonth() === 3 && date.getDate() === 1) {
      document.body.classList.add('april-fools');
    }

    if (remote.getCurrentWindow().isMaximized()) {
      document.body.classList.add('maximized');
    } else {
      document.body.classList.remove('maximized');
    }
    remote.getCurrentWindow().on('maximize', () => document.body.classList.add('maximized'));
    remote.getCurrentWindow().on('unmaximize', () => document.body.classList.remove('maximized'));
  }

  pluginWillUnload () {
    this.callbacks.forEach(cb => cb());
  }
};
