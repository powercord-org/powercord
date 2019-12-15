// based off of https://github.com/rauenzi/BetterDiscordAddons/blob/master/Plugins/DoNotTrack/DoNotTrack.plugin.js

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

    const Sentry = window.__SENTRY__.hub;
    const SentryClient = Sentry.getClient();
    Sentry.__oldAddBreadcrumb = Sentry.addBreadcrumb;
    Sentry.getIntegration({ id: 'Breadcrumbs' })._old_domBreadcrumb = Sentry.getIntegration({ id: 'Breadcrumbs' })._domBreadcrumb;
    SentryClient.old_processEvent = SentryClient._processEvent;
    SentryClient.old_prepareEvent = SentryClient._prepareEvent;
    window.__oldConsole = window.console;

    SentryClient.close();
    Sentry.addBreadcrumb = () => void 0;
    Sentry.getIntegration({ id: 'Breadcrumbs' })._domBreadcrumb = () => void 0;
    SentryClient._processEvent = () => void 0;
    SentryClient._prepareEvent = () => void 0;
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

    const Sentry = window.__SENTRY__.hub;
    const SentryClient = Sentry.getClient();
    SentryClient.getOptions().enabled = true;
    Sentry.addBreadcrumb = Sentry.__oldAddBreadcrumb;
    Sentry.getIntegration({ id: 'Breadcrumbs' })._domBreadcrumb = Sentry.getIntegration({ id: 'Breadcrumbs' })._old_domBreadcrumb;
    SentryClient._processEvent = SentryClient.old_processEvent;
    SentryClient._prepareEvent = SentryClient.old_prepareEvent;
    window.console = window.__oldConsole;
  }
};
