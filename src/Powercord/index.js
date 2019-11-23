/**
 * Powercord, a lightweight @discordapp client mod focused on simplicity and performance
 * Copyright (C) 2018-2019  aetheryx & Bowser65
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const { shell: { openExternal } } = require('electron');
const { get } = require('powercord/http');
const { sleep } = require('powercord/util');
const Webpack = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { Updatable } = require('powercord/entities');
const { join } = require('path');

const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const PluginManager = require('./managers/plugins');
const StyleManager = require('./managers/styles');
const APIManager = require('./managers/apis');
const modules = require('./modules');

module.exports = class Powercord extends Updatable {
  constructor () {
    super(join(__dirname, '..', '..'), '', 'powercord');

    this.cacheFolder = join(__dirname, '..', '..', '.cache');
    this.api = {};
    this.gitInfos = {
      upstream: '???',
      branch: '???',
      revision: '???'
    };
    this.initialized = false;
    this.styleManager = new StyleManager();
    this.pluginManager = new PluginManager();
    this.apiManager = new APIManager();
    this.account = null;
    this.isLinking = false;
    this.hookRPCServer();
    this.patchWebSocket();

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  // Powercord initialization
  async init () {
    const isOverlay = (/overlay/).test(location.pathname);
    if (isOverlay) { // eh
      // await sleep(250);
    }

    // Webpack & Modules
    await Webpack.init();
    await Promise.all(modules.map(mdl => mdl()));

    // Start
    await this.startup();
    this.fetchAccount();

    const SentryModule = await require('powercord/webpack').getModule([ '_originalConsoleMethods', '_wrappedBuiltIns' ]);
    const buildId = SentryModule._globalOptions.release;
    this.gitInfos = await this.pluginManager.get('pc-updater').getGitInfos();
    this.buildInfo = `Release Channel: ${window.GLOBAL_ENV.RELEASE_CHANNEL} - Discord's Build Number: ${buildId} - Powercord's git revision: ${this.gitInfos.revision}@${this.gitInfos.branch}`;

    // Token manipulation stuff
    if (this.settings.get('hideToken', true)) {
      const tokenModule = await require('powercord/webpack').getModule([ 'hideToken' ]);
      tokenModule.hideToken = () => void 0;
      tokenModule.showToken(); // just to be sure
    }

    this.emit('loaded');
  }

  // Powercord startup
  async startup () {
    // APIs
    await this.apiManager.startAPIs();
    this.settings = powercord.api.settings.buildCategoryObject('pc-general');

    // Style Manager
    this.styleManager.loadThemes();

    // Plugins
    await this.pluginManager.startPlugins();

    this.initialized = true;
  }

  // Powercord shutdown
  async shutdown () {
    this.initialized = false;
    // Plugins
    await this.pluginManager.shutdownPlugins();

    // Style Manager
    this.styleManager.unloadThemes();

    // APIs
    await this.apiManager.unload();
  }

  // Bad code
  async hookRPCServer () {
    const _this = this;
    // eslint-disable-next-line no-unmodified-loop-condition
    while (!global.DiscordNative) {
      await sleep(1);
    }

    const discordRpc = DiscordNative.nativeModules.requireModule('discord_rpc');
    const { createServer } = discordRpc.RPCWebSocket.http;
    discordRpc.RPCWebSocket.http.createServer = function () {
      _this.rpcServer = createServer();
      return _this.rpcServer;
    };
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
      const baseUrl = this.settings.get('backendURL', WEBSITE);
      console.debug('%c[Powercord]', 'color: #7289da', 'Logging in to your account...');

      const resp = await get(`${baseUrl}/api/users/@me`)
        .set('Authorization', token)
        .catch(e => e);

      if (resp.statusCode === 401) {
        if (!resp.body.error && resp.body.error !== 'DISCORD_REVOKED') {
          const announcements = powercord.pluginManager.get('pc-announcements');
          if (announcements) {
            // even if the plugin is not ready yet, we can perform actions
            announcements.sendNotice({
              id: 'pc-account-discord-unlinked',
              type: announcements.Notice.TYPES.RED,
              message: 'Your Powercord account is no longer linked to your Discord account! Some integration will be disabled.',
              button: {
                text: 'Link it back',
                onClick: () => {
                  announcements.closeNotice('pc-account-discord-unlinked');
                  openExternal(`${WEBSITE}/oauth/discord`);
                }
              },
              alwaysDisplay: true
            });
          }

          this.isLinking = false;
          return; // keep token stored
        }
        this.settings.set('powercordToken', null);
        this.account = null;
        this.isLinking = false;
        return console.error('%c[Powercord]', 'color: #7289da', 'Unable to fetch your account (Invalid token). Removed token from config');
      } else if (resp.statusCode !== 200) {
        this.account = null;
        this.isLinking = false;
        return console.error('%c[Powercord]', 'color: #7289da', `An error occurred while fetching your account: ${resp.statusCode} - ${resp.statusText}`, resp.body);
      }

      this.account = resp.body;
      this.account.token = token;
    } else {
      this.account = null;
    }
    console.debug('%c[Powercord]', 'color: #7289da', 'Logged in!');
    this.isLinking = false;
  }

  async _update (force = false) {
    const success = await super._update(force);
    if (success) {
      await exec('npm install --only=prod', { cwd: this.entityPath });
      const updater = this.pluginManager.get('pc-updater');
      if (!document.querySelector('#powercord-updater, .powercord-updater')) {
        powercord.api.notices.sendToast('powercord-updater', {
          header: 'Update complete!',
          content: 'Please click "Reload" to complete the final stages of this Powercord update.',
          type: 'success',
          buttons: [ {
            text: 'Reload',
            color: 'green',
            look: 'ghost',
            onClick: () => location.reload()
          }, {
            text: 'Postpone',
            color: 'grey',
            look: 'outlined'
          } ]
        });
      }
      updater.settings.set('awaiting_reload', true);
    }
    return success;
  }

  // idk i was bored and people need to know the truth
  get isEmmaCute () {
    return () => true;
  }

  get isEmmaNotCute () {
    return () => false;
  }

  get emma () {
    // no u ain't going to make it negative uwu
    const cuteIncrement = Math.max(0, this.settings.get('_cute_inc', 0));
    this.settings.set('_cute_inc', cuteIncrement + 0.1);
    return {
      cute: true,
      percent: 100.0 + cuteIncrement,
      uwu: '🌺'
    };
  }

  // No emma u wont edit those UwU
  set emma (_) {
    throw new Error('TooCuteException: awooooo');
  }

  set isEmmaCute (_) {
    throw new Error('TooCuteException: awooooo');
  }

  set isEmmaNotCute (_) {
    throw new Error('TooCuteException: awooooo');
  }

  // i was still bored
  get daddy () {
    return 'aeth uwu';
  }
};
