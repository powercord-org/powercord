const EventEmitter = require('events');
const { get } = require('powercord/http');
const { sleep } = require('powercord/util');
const modules = require('./modules');
const PluginManager = require('./pluginManager');
const SettingsManager = require('./settingsManager');

module.exports = class Powercord extends EventEmitter {
  constructor () {
    super();

    this.pluginManager = new PluginManager();
    this.settings = new SettingsManager('general');
    this.account = null;
    this.isLinking = false;
    this.patchWebSocket();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  patchWebSocket () {
    const _this = this;

    window.WebSocket = class PatchedWebSocket extends window.WebSocket {
      constructor (url) {
        super(url);

        this.addEventListener('message', (data) => {
          _this.emit(`webSocketMessage:${data.origin.slice(6)}`, data);
        });
      }
    };
  }

  async init () {
    await Promise.all(modules.map(mdl => mdl()));
    const isOverlay = (/overlay/).test(location.pathname);
    // In Discord client I have usually 21 entries in it. In the overlay I usually have 19 entries
    while (window.webpackJsonp.length < (isOverlay ? 19 : 21)) {
      await sleep(1);
    }

    this.fetchAccount();
    if (this.settings.get('hideToken', true)) {
      require('powercord/webpack').getModule([ 'hideToken' ]).hideToken = () => void 0;
    }
    this.pluginManager.startPlugins();

    if (this.account && this.settings.get('settingsSync', false)) {
      SettingsManager.download();
    }

    window.addEventListener('beforeunload', () => {
      if (this.account && this.settings.get('settingsSync', false)) {
        SettingsManager.upload();
      }
    });
  }

  async fetchAccount () {
    if (this.isLinking) {
      while (this.isLinking) {
        await sleep(1);
      }
      return;
    }

    this.isLinking = true;
    const token = this.settings.get('powercordToken', null);
    if (token) {
      const baseUrl = this.settings.get('backendURL', 'https://powercord.xyz');
      console.debug('%c[Powercord]', 'color: #257dd4', 'Logging in to your account...');

      const resp = await get(`${baseUrl}/api/users/@me`)
        .set('Authorization', token)
        .catch(e => e);

      if (resp.statusCode === 401) {
        this.settings.set('powercordToken', null);
        this.account = null;
        this.isLinking = false;
        return console.error('%c[Powercord]', 'color: #257dd4', 'Unable to fetch your account (Invalid token). Removed token from config');
      } else if (resp.statusCode !== 200) {
        this.account = null;
        this.isLinking = false;
        return console.error('%c[Powercord]', 'color: #257dd4', `An error occurred while fetching your account: ${resp.statusCode} - ${resp.statusText}`, resp.body);
      }

      this.account = resp.body;
    } else {
      this.account = null;
    }
    console.debug('%c[Powercord]', 'color: #257dd4', 'Logged in!');
    this.isLinking = false;
  }
};
