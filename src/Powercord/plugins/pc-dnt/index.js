/* eslint-disable no-empty-function */
// based off of https://github.com/rauenzi/BetterDiscordAddons/blob/master/Plugins/DoNotTrack/DoNotTrack.plugin.js

const Plugin = require('powercord/Plugin');
const webpack = require('powercord/webpack');

module.exports = class DoNotTrack extends Plugin {
  start () {
    const Analytics = webpack.getModule([ 'AnalyticEventConfigs' ]);
    Analytics.track = () => {};

    const Warning = webpack.getModule([ 'consoleWarning' ]);
    Warning.consoleWarning = () => {};

    const MethodWrapper = webpack.getModule([ 'wrapMethod' ]);
    MethodWrapper.wrapMethod = () => {};

    const Sentry = webpack.getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ]);
    Sentry.uninstall();
    Sentry._breadcrumbEventHandler = () => () => {};
    Sentry.captrureBreadcrumb = () => {};
    Sentry._sendProcessedPayload = () => {};
    Sentry._send = () => {};
    Object.assign(window.console, Sentry._originalConsoleMethods);
  }
};
