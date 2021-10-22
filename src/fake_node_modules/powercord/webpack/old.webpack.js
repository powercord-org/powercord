/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { sleep } = require('powercord/util');
const moduleFilters = require('./modules.json');

/**
* @typedef WebpackInstance
* @property {object} cache
* @property {function} require
*/

/**
* @typedef ContextMenuModule
* @property {function} openContextMenu
* @property {function} closeContextMenu
*/

/**
* @property {ContextMenuModule} contextMenu
* @property {WebpackInstance} instance
*/
const webpack = {
  /**
  * Grabs a module from the Webpack store
  * @param {function|string[]} filter Filter used to grab the module. Can be a function or an array of keys the object must have.
  * @param {boolean} retry Whether or not to retry fetching if the module is not found. Each try will be delayed by 100ms and max retries is 20.
  * @param {boolean} forever If Powercord should try to fetch the module forever. Should be used only if you're in early stages of startup.
  * @returns {Promise<object>|object} The found module. A promise will always be returned, unless retry is false.
  */
  getModule (filter, retry = true, forever = false) {
    if (Array.isArray(filter)) {
      const keys = filter;
      filter = m => keys.every(key => m.hasOwnProperty(key) || (m.__proto__ && m.__proto__.hasOwnProperty(key)));
    }

    if (!retry) {
      return webpack._getModules(filter);
    }

    return new Promise(async (res) => {
      let mdl;
      for (let i = 0; i < (forever ? 666 : 21); i++) {
        mdl = webpack._getModules(filter);
        if (mdl) {
          return res(mdl);
        }
        await sleep(100);
      }

      res(mdl);
    });
  },

  /**
  * Grabs all found modules from the webpack store
  * @param {function|string[]} filter Filter used to grab the module. Can be a function or an array of keys the object must have.
  * @returns {object[]} The found modules.
  */
  getAllModules (filter) {
    if (Array.isArray(filter)) {
      const keys = filter;
      filter = m => keys.every(key => m.hasOwnProperty(key) || (m.__proto__ && m.__proto__.hasOwnProperty(key)));
    }

    return webpack._getModules(filter, true);
  },

  /**
  * Grabs a React component by its display name
  * @param {string} displayName Component's display name.
  * @param {boolean} retry Whether or not to retry fetching if the module is not found. Each try will be delayed by 100ms and max retries is 20.
  * @param {boolean} forever If Powercord should try to fetch the module forever. Should be used only if you're in early stages of startup.
  * @returns {Promise<object>|object} The component. A promise will always be returned, unless retry is false.
  */
  getModuleByDisplayName (displayName, retry = true, forever = false) {
    return webpack.getModule(m => m.displayName && m.displayName.toLowerCase() === displayName.toLowerCase(), retry, forever);
  },

  /**
  * Initializes the injection into Webpack
  * @returns {Promise<void>}
  */
  async init () {
    delete webpack.init;

    // Wait until webpack is ready
    while (!window.webpackChunkdiscord_app || !window._) {
      await sleep(100);
    }

    // Extract values from webpack
    webpack.instance = {};
    webpackChunkdiscord_app.push([
      [ [ '_powercord' ] ],
      {},
      (r) => {
        webpack.instance.cache = r.c;
        webpack.instance.require = (m) => r(m);
      }
    ]);

    // Load modules pre-fetched
    for (const mdl in moduleFilters) {
      // noinspection JSUnfilteredForInLoop
      this[mdl] = await webpack.getModule(moduleFilters[mdl]);
    }

    this.i18n = webpack.getAllModules([ 'Messages', 'getLanguages' ]).find((m) => m.Messages.ACCOUNT);
  },

  _getModules (filter, all = false) {
    const moduleInstances = Object.values(webpack.instance.cache).filter(m => m.exports);
    if (all) {
      const exports = moduleInstances.filter(m => filter(m.exports)).map(m => m.exports);
      const expDefault = moduleInstances.filter(m => m.exports.default && filter(m.exports.default)).map(m => m.exports.default);
      return exports.concat(expDefault);
    }

    const exports = moduleInstances.find(m => filter(m.exports));
    if (exports) {
      return exports.exports;
    }
    const expDefault = moduleInstances.find(m => m.exports.default && filter(m.exports.default));
    if (expDefault) {
      return expDefault.exports.default;
    }
    return null;
  }
};

module.exports = webpack;
