const EventEmitter = require('events');
const { get } = require('powercord/http');
const modules = require('./modules');
const PluginManager = require('./pluginManager');
const SettingsManager = require('./settingsManager');

module.exports = class Powercord extends EventEmitter {
  constructor () {
    super();

    this.pluginManager = new PluginManager();
    this.settings = new SettingsManager('general');
    this.account = null;
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
    await this.fetchAccount();
    await Promise.all(modules.map(mdl => mdl()));
    this.pluginManager.startPlugins();
  }

  async fetchAccount () {
    const token = this.settings.get('powercordToken', null);
    if (token) {
      const baseUrl = this.settings.get('backendURL', 'https://powercord.xyz');
      console.log('%c[Powercord]', 'color: #257dd4', 'Logging in to your account...');

      const resp = await get(`${baseUrl}/api/users/@me`)
        .set('Authorization', token)
        .catch(e => e);

      if (resp.statusCode === 401) {
        this.settings.set('powercordToken', null);
        return console.error('%c[Powercord]', 'color: #257dd4', 'Unable to fetch your account (Invalid token). Removed token from config');
      } else if (resp.statusCode !== 200) {
        return console.error('%c[Powercord]', 'color: #257dd4', `An error occurred while fetching your account: ${resp.statusCode} - ${resp.statusText}`, resp.body);
      }

      console.log(resp);
    }
  }
};
