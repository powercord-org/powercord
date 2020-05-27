const { API } = require('powercord/entities');
const { getModule } = require('powercord/webpack');

/**
 * @typedef PowercordRoute
 * @property {String} path Route path
 * @property {Boolean} noSidebar Whether the sidebar should be removed or not
 * @property {function(): React.ReactNode} render Route renderer
 */

/**
 * Powercord custom router API
 * @property {PowercordRoute[]} routes Registered routes
 */
class RouterAPI extends API {
  constructor () {
    super();

    this.routes = [];
  }

  /**
   * Restores previous navigation if necessary
   */
  async restorePrevious () {
    const oldRoute = DiscordNative.globals.appSettings.get('_POWERCORD_ROUTE');
    if (oldRoute && this.routes.find(c => c.path === oldRoute.split('/_powercord')[1])) {
      const router = await getModule([ 'replaceWith' ]);
      router.replaceWith(oldRoute);
    }
    DiscordNative.globals.appSettings.set('_POWERCORD_ROUTE', void 0);
    DiscordNative.globals.appSettings.save();
  }

  /**
   * Registers a route
   * @param {PowercordRoute} route Route to register
   * @emits RouterAPI#routeAdded
   */
  registerRoute (route) {
    if (this.routes.find(r => r.path === route.path)) {
      throw new Error(`Route ${route.path} is already registered!`);
    }
    this.routes.push(route);
    this.emit('routeAdded', route);
  }

  /**
   * Unregisters a route
   * @param {String} path Route to unregister
   * @emits RouterAPI#routeRemoved
   */
  unregisterScope (path) {
    if (this.routes.find(r => r.path === path)) {
      this.routes = this.routes.filter(r => r.path !== path);
      this.emit('routeRemoved', path);
    }
  }
}

module.exports = RouterAPI;
