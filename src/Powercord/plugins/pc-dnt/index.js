/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
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

const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');

module.exports = class DoNotTrack extends Plugin {
  async startPlugin () {
    const Analytics = await getModule([ 'getSuperPropertiesBase64' ]);
    Analytics.__oldTrack = Analytics.track;
    Analytics.track = () => void 0;

    const Reporter = await getModule([ 'submitLiveCrashReport' ]);
    Reporter.__oldSubmitLiveCrashReport = Reporter.submitLiveCrashReport;
    Reporter.submitLiveCrashReport = () => void 0;

    const Sentry = {
      main: window.__SENTRY__.hub,
      client: window.__SENTRY__.hub.getClient(),
      breadcrumbs: window.__SENTRY__.hub.getIntegration({ id: 'Breadcrumbs' })
    };

    Sentry.main.__oldAddBreadcrumb = Sentry.main.addBreadcrumb;
    Sentry.breadcrumbs.__old_domBreadcrumb = Sentry.breadcrumbs._domBreadcrumb;
    Sentry.client.__old_processEvent = Sentry.client._processEvent;
    Sentry.client.__old_prepareEvent = Sentry.client._prepareEvent;
    window.__oldConsole = window.console;

    Sentry.client.close();
    Sentry.main.addBreadcrumb = () => void 0;
    Sentry.breadcrumbs._domBreadcrumb = () => void 0;
    Sentry.client._processEvent = () => void 0;
    Sentry.client._prepareEvent = () => void 0;
    Object.assign(window.console, [ 'debug', 'info', 'warn', 'error', 'log', 'assert' ].forEach(
      (method) => window.console[method] = window.console[method].__sentry_original__)
    );

    /*
     * Discord calls removeEventListener with a single argument in their ConfettiCannon component. Sentry prevents it
     * from crashing the client since it explicitly passes undefined as a side-effect, but since we remove it we add
     * our own layer of protection to prevent execution of the native method in that case.
     *
     * If a Discord employee is lurking this commit, please specify the type of event you want to remove. You're calling
     * removeEventListener with the function only (this.setSize), say thanks to Sentry for preventing crashes!
     */
    this.__rel = EventTarget.prototype.removeEventListener;
    const _this = this;
    EventTarget.prototype.removeEventListener = function (...args) {
      if (args.length === 1) {
        return console.warn('EventTarget.removeEventListener called with a single argument; execution prevented.');
      }
      _this.__rel.call(this, ...args);
    };
  }

  async pluginWillUnload () {
    EventTarget.prototype.removeEventListener = this.__rel;

    const Analytics = getModule([ 'getSuperPropertiesBase64' ], false);
    Analytics.track = Analytics.__oldTrack;

    const Reporter = getModule([ 'submitLiveCrashReport' ], false);
    Reporter.submitLiveCrashReport = Reporter.__oldSubmitLiveCrashReport;

    const Sentry = {
      main: window.__SENTRY__.hub,
      client: window.__SENTRY__.hub.getClient(),
      breadcrumbs: window.__SENTRY__.hub.getIntegration({ id: 'Breadcrumbs' })
    };

    Sentry.client.getOptions().enabled = true;
    Sentry.main.addBreadcrumb = Sentry.main.__oldAddBreadcrumb;
    Sentry.breadcrumbs._domBreadcrumb = Sentry.breadcrumbs.__old_domBreadcrumb;
    Sentry.client._processEvent = Sentry.client.__old_processEvent;
    Sentry.client._prepareEvent = Sentry.client.__old_prepareEvent;
    window.console = window.__oldConsole;
  }
};
