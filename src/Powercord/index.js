const EventEmitter = require('events');

const modules = require('./modules');
const PluginManager = require('./pluginManager');
const SettingsManager = require('./settingsManager');

module.exports = class Powercord extends EventEmitter {
  constructor () {
    super();

    this.pluginManager = new PluginManager();
    this.settings = new SettingsManager('general');
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
    this.pluginManager.startPlugins();
  }
};
