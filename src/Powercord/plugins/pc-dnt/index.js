// based off of https://github.com/rauenzi/BetterDiscordAddons/blob/master/Plugins/DoNotTrack/DoNotTrack.plugin.js

const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');

module.exports = class DoNotTrack extends Plugin {
  async startPlugin () {
    const Analytics = await getModule([ 'AnalyticEventConfigs' ]);
    Analytics.__oldTrack = Analytics.track;
    Analytics.track = () => void 0;

    const MethodWrapper = await getModule([ 'wrapMethod' ]);
    MethodWrapper.__oldWrapMethod = MethodWrapper.wrapMethod;
    MethodWrapper.wrapMethod = () => void 0;

    const Reporter = await getModule([ 'report' ]);
    Reporter.__oldReport = Reporter.report;
    Reporter.report.uninstall();

    const Sentry = await getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ]);
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

  async pluginWillUnload () {
    const Analytics = getModule([ 'AnalyticEventConfigs' ], false);
    Analytics.track = Analytics.__oldTrack;

    const MethodWrapper = getModule([ 'wrapMethod' ], false);
    MethodWrapper.wrapMethod = MethodWrapper.__oldWrapMethod;

    const Reporter = getModule([ 'report' ], false);
    Reporter.report = Reporter.__oldReport;

    const Sentry = getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ], false);
    Sentry.install();
    Sentry._breadcrumbEventHandler = Sentry.__old_breadcrumbEventHandler;
    Sentry.captrureBreadcrumb = Sentry.__oldCaptrureBreadcrumb;
    Sentry._sendProcessedPayload = Sentry.__old_sendProcessedPayload;
    Sentry._send = Sentry.__old_send;
    window.console = window.__oldConsole;
  }
};
