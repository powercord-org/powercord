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
  }

  pluginWillUnload () {
    this.callbacks.forEach(cb => cb());
  }
};
