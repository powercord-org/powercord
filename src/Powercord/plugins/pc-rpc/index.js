const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { inject, uninject } = require('powercord/injector');

module.exports = class RPC extends Plugin {
  async startPlugin () {
    this.handlers = await getModule([ 'INVITE_BROWSER' ]);
    this._patchHTTPServer();
    this._patchWebSocketServer();

    this._boundAddEvent = this._addEvent.bind(this);
    this._boundRemoveEvent = this._removeEvent.bind(this);

    powercord.api.rpc.registerScope('POWERCORD_PRIVATE', w => w === WEBSITE);
    powercord.api.rpc.on('eventAdded', this._boundAddEvent);
    powercord.api.rpc.on('eventRemoved', this._boundRemoveEvent);
  }

  pluginWillUnload () {
    uninject('pc-rpc-ws');
    uninject('pc-rpc-ws-promise');

    powercord.api.rpc.removeAllListeners('request');
    powercord.api.rpc.on('request', this._originalHandler);

    powercord.api.rpc.unregisterScope('POWERCORD_PRIVATE');
    powercord.api.rpc.off('eventAdded', this._boundAddEvent);
    powercord.api.rpc.off('eventRemoved', this._boundRemoveEvent);
  }

  _patchHTTPServer () {
    [ this._originalHandler ] = powercord.api.rpc.listeners('request');
    powercord.api.rpc.removeAllListeners('request');
    powercord.api.rpc.on('request', (req, res) => {
      console.log(req);
      if (req.url === '/powercord') {
        const data = JSON.stringify({
          code: 69,
          powercord: powercord.gitInfos,
          plugins: [ ...powercord.pluginManager.plugins.values() ].filter(p => !p.isInternal).map(p => p.entityID),
          themes: [ ...powercord.styleManager.themes.values() ].filter(t => t.isTheme).map(t => t.entityID)
        });

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.setHeader('Content-Length', data.length);
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      } else {
        this._originalHandler(req, res);
      }
    });
  }

  async _patchWebSocketServer () {
    const websocketHandler = await getModule([ 'validateSocketClient' ]);

    inject('pc-rpc-ws', websocketHandler, 'validateSocketClient', args => {
      if (args[2] === 'powercord') {
        args[2] = void 0;
        args[3] = 'powercord';
      }
      return args;
    }, true);

    inject('pc-rpc-ws-promise', websocketHandler, 'validateSocketClient', (args, res) => {
      if (args[3] === 'powercord') {
        res.catch(() => void 0); // Shut
        args[0].authorization.scopes = [
          'POWERCORD',
          ...Object.keys(powercord.api.rpc.scopes).filter(s => powercord.api.rpc.scopes[s](args[1]))
        ];
        return Promise.resolve(null);
      }
      return res;
    });
  }

  _addEvent (event) {
    this.handlers[event] = powercord.rpc.api.events[event];
  }

  _removeEvent (event) {
    delete this.handlers[event];
  }
};
