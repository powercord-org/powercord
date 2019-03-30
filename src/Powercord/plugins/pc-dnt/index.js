// based off of https://github.com/rauenzi/BetterDiscordAddons/blob/master/Plugins/DoNotTrack/DoNotTrack.plugin.js

const { Plugin } = require('powercord/entities');
const webpack = require('powercord/webpack');

module.exports = class DoNotTrack extends Plugin {
  startPlugin () {
    const Analytics = webpack.getModule([ 'AnalyticEventConfigs' ]);
    Analytics.__oldTrack = Analytics.track;
    Analytics.track = () => void 0;

    const Warning = webpack.getModule([ 'consoleWarning' ]);
    Warning.__oldConsoleWarning = Warning.consoleWarning;
    Warning.consoleWarning = () => void 0;

    const MethodWrapper = webpack.getModule([ 'wrapMethod' ]);
    MethodWrapper.__oldWrapMethod = MethodWrapper.wrapMethod;
    MethodWrapper.wrapMethod = () => void 0;

    const Sentry = webpack.getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ]);
    Sentry.__old_breadcrumbEventHandler = Sentry._breadcrumbEventHandler;
    Sentry.__oldCaptrureBreadcrumb = Sentry.captrureBreadcrumb;
    Sentry.__old_sendProcessedPayload = Sentry._sendProcessedPayload;
    Sentry.__old_send = Sentry._send;
    window.__oldConsole = window.console;

    Sentry.uninstall();
    Sentry._breadcrumbEventHandler = () => () => void 0;
    Sentry.captrureBreadcrumb = () => void 0;
    Sentry._sendProcessedPayload = () => void 0;
    Sentry._send = () => void 0;
    Object.assign(window.console, Sentry._originalConsoleMethods);
  }

  pluginWillUnload () {
    const Analytics = webpack.getModule([ 'AnalyticEventConfigs' ]);
    Analytics.track = Analytics.__oldTrack;

    const Warning = webpack.getModule([ 'consoleWarning' ]);
    Warning.consoleWarning = Warning.__oldConsoleWarning;

    const MethodWrapper = webpack.getModule([ 'wrapMethod' ]);
    MethodWrapper.wrapMethod = MethodWrapper.__oldWrapMethod;

    const Sentry = webpack.getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ]);
    Sentry.install();
    Sentry._breadcrumbEventHandler = Sentry.__old_breadcrumbEventHandler;
    Sentry.captrureBreadcrumb = Sentry.__oldCaptrureBreadcrumb;
    Sentry._sendProcessedPayload = Sentry.__old_sendProcessedPayload;
    Sentry._send = Sentry.__old_send;
    window.console = window.__oldConsole;
  }
};
