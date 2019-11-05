/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
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
const { getOwnerInstance, waitFor } = require('powercord/util');

module.exports = class Toasts extends API {
  constructor () {
    super();

    this.toasts = [];
  }

  registerToast (id, ...props) {
    if (this.toasts.find(t => t.toast === id)) {
      return this.error(`ID ${id} is already used by another plugin!`);
    }

    return this.toasts.push({
      id,
      ...props[0]
    });
  }

  unregisterToast (toast) {
    this.toasts = this.toasts.filter(t => t.id !== toast);
  }

  sendToast (id, ...props) {
    this.registerToast(id, props[0]);
    this.updateToastContainer();
  }

  closeToast (id) {
    const toast = this.toasts.find(toast => toast.id === id);
    if (toast) {
      if (toast.callback && typeof toast.callback === 'function') {
        toast.callback();
      }

      toast.leaving = true;
    }

    this.updateToastContainer();

    setTimeout(() => {
      this.unregisterToast(id);
      this.updateToastContainer();
    }, 500);
  }

  async updateToastContainer () {
    const toastsContainer = await waitFor('.powercord-toastsContainer');
    return getOwnerInstance(toastsContainer)._reactInternalFiber.return.stateNode.forceUpdate();
  }
};
