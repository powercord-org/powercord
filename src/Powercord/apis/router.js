const { API } = require('powercord/entities');

/**
 * @typedef PowercordRoute
 * @property {String} path Route path
 * @property {Boolean} noSidebar Whether the sidebar should be removed or not
 * @property {function(): React.ReactNode} render Route renderer
 */

/**
 * @typedef PowercordDeeplink
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
    return null;
    /*
     * const oldRoute = await DiscordNative.settings.get('_POWERCORD_ROUTE');
     * if (oldRoute && this.routes.find(c => c.path === oldRoute.split('/_powercord')[1])) {
     *   const router = await getModule([ 'replaceWith' ]);
     *   router.replaceWith(oldRoute);
     * }
     * return DiscordNative.settings.set('_POWERCORD_ROUTE', void 0);
     */
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
  unregisterRoute (path) {
    if (this.routes.find(r => r.path === path)) {
      this.routes = this.routes.filter(r => r.path !== path);
      this.emit('routeRemoved', path);
    }
  }
}

module.exports = RouterAPI;
