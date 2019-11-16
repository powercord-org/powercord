const { Plugin } = require('powercord/entities');
const { getModule } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { inject, uninject } = require('powercord/injector');

module.exports = class RPC extends Plugin {
  async _startPlugin () { // Soon :)
    this.handlers = await getModule([ 'INVITE_BROWSER' ]);
    this._patchHTTPServer();
    this._patchWebSocketServer();
  }

  pluginWillUnload () {
    uninject('pc-rpc-ws');
    uninject('pc-rpc-ws-promise');

    powercord.rpcServer.removeAllListeners('request');
    powercord.rpcServer.on('request', this._originalHandler);
  }

  _patchHTTPServer () {
    [ this._originalHandler ] = powercord.rpcServer.listeners('request');
    powercord.rpcServer.removeAllListeners('request');
    powercord.rpcServer.on('request', (req, res) => {
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
        // noinspection JSPrimitiveTypeWrapperUsage
        args[0].authorization.scopes = [ 'POWERCORD' ];
        if (args[1] === WEBSITE) {
          args[0].authorization.scopes.push('POWERCORD_PRIVATE');
        }
        return new Promise(res => res());
      }
      return res;
    });
  }

  _addEvent (event, handler, validation, internal = false) {
    const rpcHandler = {
      scope: internal ? 'POWERCORD_PRIVATE' : 'POWERCORD',
      handler
    };
    if (validation) {
      rpcHandler.validation = validation;
    }
    this.handlers[event] = rpcHandler;
  }

  _removeEvent (event) {
    delete this.handlers[event];
  }
};
