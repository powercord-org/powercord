const EventEmitter = require('events');
const { resolve } = require('path');
const { writeFile } = require('fs');

const modules = require('./modules');
const PluginManager = require('./pluginManager');

module.exports = class Powercord extends EventEmitter {
  constructor (config) {
    super();

    this.config = config;
    this.pluginManager = new PluginManager();
    this.patchWebSocket();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  editConfig (key, value) {
    this.config[key] = value;
    writeFile(resolve(__dirname, '..', '..', 'config.json'), JSON.stringify(this.config, null, 2), () => null);
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
