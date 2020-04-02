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
      (method) => {
        if (window.console[method].__sentry_original__) {
          window.console[method] = window.console[method].__sentry_original__;
        } else if (window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__) {
          window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__ = window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__.__sentry_original__;
        }
      })
    );
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
