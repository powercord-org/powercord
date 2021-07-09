/**
 * Copyright (c) 2018-2021 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { getModule } = require('powercord/webpack');

module.exports = async function () {
  const Analytics = await getModule([ 'getSuperPropertiesBase64' ]);
  const Reporter = await getModule([ 'submitLiveCrashReport' ]);
  const Sentry = {
    main: window.__SENTRY__.hub,
    client: window.__SENTRY__.hub.getClient()
  };

  Analytics.__oldTrack = Analytics.track;
  Analytics.track = () => void 0;

  Reporter.__oldSubmitLiveCrashReport = Reporter.submitLiveCrashReport;
  Reporter.submitLiveCrashReport = () => void 0;

  Sentry.client.close();
  Sentry.main.getScope().clear();
  Sentry.main.__oldAddBreadcrumb = Sentry.main.addBreadcrumb;
  Sentry.main.addBreadcrumb = () => void 0;

  window.__oldConsole = window.console;
  Object.assign(window.console, [ 'debug', 'info', 'warn', 'error', 'log', 'assert' ].forEach(
    (method) => {
      // @todo: figure out react devtools and if this is necessary
      if (window.console[method].__sentry_original__) {
        window.console[method] = window.console[method].__sentry_original__;
      } else if (window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__) {
        window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__ = window.console[method].__REACT_DEVTOOLS_ORIGINAL_METHOD__.__sentry_original__;
      }
    })
  );

  return () => {
    Analytics.track = Analytics.__oldTrack;
    Reporter.submitLiveCrashReport = Reporter.__oldSubmitLiveCrashReport;
    Sentry.main.addBreadcrumb = Sentry.main.__oldAddBreadcrumb;
    Sentry.client.getOptions().enabled = true;
    window.console = window.__oldConsole;
  };
};
