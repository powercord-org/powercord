const { API } = require('powercord/entities');
const { getModule } = require('powercord/webpack');

module.exports = class RouterAPI extends API {
  constructor () {
    super();
    this.routes = [];
    this.changeListeners = [];
  }

  async restorePrevious () {
    const oldRoute = DiscordNative.globals.appSettings.get('_POWERCORD_ROUTE');
    if (oldRoute && this.routes.find(c => c.path === oldRoute.split('/_powercord')[1])) {
      const router = await getModule([ 'replaceWith' ]);
      router.replaceWith(oldRoute);
    }
    DiscordNative.globals.appSettings.set('_POWERCORD_ROUTE', void 0);
    DiscordNative.globals.appSettings.save();
  }

  registerRoute (path, render, noSidebar = false) {
    if (this.routes.find(c => c.path === path)) {
      return this.error(`Path ${path} is already registered by another plugin!`);
    }

    this.routes.push({
      path,
      render,
      noSidebar
    });
    this._change();
  }

  unregisterRoute (path) {
    this.routes = this.routes.filter(c => c.path !== path);
    this._change();
  }

  // @todo: eventify
  addChangeListener (listener) {
    this.changeListeners.push(listener);
  }

  removeChangeListener (listener) {
    this.changeListeners = this.changeListeners.filter(l => l !== listener);
  }

  _change () {
    this.changeListeners.forEach(fn => fn());
  }
};
