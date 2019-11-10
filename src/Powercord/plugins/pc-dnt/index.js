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
    Sentry.__oldCaptureBreadcrumb = Sentry.captureBreadcrumb;
    Sentry.__old_sendProcessedPayload = Sentry._sendProcessedPayload;
    Sentry.__old_send = Sentry._send;
    window.__oldConsole = window.console;

    Sentry.uninstall();
    Sentry._breadcrumbEventHandler = () => () => void 0;
    Sentry.captureBreadcrumb = () => void 0;
    Sentry._sendProcessedPayload = () => void 0;
    Sentry._send = () => void 0;
    Object.assign(window.console, Sentry._originalConsoleMethods);

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

    const Analytics = getModule([ 'AnalyticEventConfigs' ], false);
    Analytics.track = Analytics.__oldTrack;

    const MethodWrapper = getModule([ 'wrapMethod' ], false);
    MethodWrapper.wrapMethod = MethodWrapper.__oldWrapMethod;

    const Reporter = getModule([ 'report' ], false);
    Reporter.report = Reporter.__oldReport;

    const Sentry = getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ], false);
    Sentry.install();
    Sentry._breadcrumbEventHandler = Sentry.__old_breadcrumbEventHandler;
    Sentry.captureBreadcrumb = Sentry.__oldCaptureBreadcrumb;
    Sentry._sendProcessedPayload = Sentry.__old_sendProcessedPayload;
    Sentry._send = Sentry.__old_send;
    window.console = window.__oldConsole;
  }
};
