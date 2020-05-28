/**
 * Powercord, a lightweight @discord client mod focused on simplicity and performance
 * Copyright (C) 2018-2020  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { API } = require('powercord/entities');

/**
 * @typedef DiscordRpcEvent
 * @todo Dig into discord's more complex selectors (seem to be mongo-ish)
 * @todo Document validation field
 * @property {String} scope RPC scope required
 * @property {function(Object): void} handler RPC event handler
 * @property {any|undefined} validation Validator for incoming data
 */

/**
 * API to tinker with Discord's RPC socket
 * @property {Object.<String, function(String): Boolean>} scopes RPC Scopes
 * @property {Object.<String, DiscordRpcEvent>} scopes RPC Scopes
 */
class RpcAPI extends API {
  constructor () {
    super();

    this.scopes = {};
    this.events = {};
  }

  /**
   * Registers a RPC scope
   * @param {String} scope RPC scope
   * @param {function(String): Boolean} grant Grant method. Receives the origin as first argument
   * @emits RpcAPI#scopeAdded
   */
  registerScope (scope, grant) {
    if (this.scopes[scope]) {
      throw new Error(`RPC scope ${scope} is already registered!`);
    }
    this.scopes[scope] = grant;
    this.emit('scopeAdded', scope);
  }

  /**
   * Registers a RPC event
   * @param {String} name Event name
   * @param {DiscordRpcEvent} properties RPC event properties
   * @emits RpcAPI#eventAdded
   */
  registerEvent (name, properties) {
    if (this.events[name]) {
      throw new Error(`RPC event ${name} is already registered!`);
    }
    this.events[name] = properties;
    this.emit('eventAdded', name);
  }

  /**
   * Unregisters a scope
   * @param {String} scope Scope to unregister
   * @emits RpcAPI#scopeRemoved
   */
  unregisterScope (scope) {
    if (this.scopes[scope]) {
      delete this.scopes[scope];
      this.emit('scopeRemoved', scope);
    }
  }

  /**
   * Unregisters an event
   * @param {String} name Name of the event to unregister
   * @emits RpcAPI#eventRemoved
   */
  unregisterEvent (name) {
    if (this.events[name]) {
      delete this.events[name];
      this.emit('eventRemoved', name);
    }
  }
}

module.exports = RpcAPI;
