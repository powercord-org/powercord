const { resolve } = require('path');
const { existsSync } = require('fs');
const { unlink } = require('fs').promises;
const { Plugin } = require('powercord/entities');
const { React, getModule, getModuleByDisplayName, constants: { Routes } } = require('powercord/webpack');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { GUILD_ID, DISCORD_INVITE } = require('powercord/constants');

const ToastContainer = require('./components/ToastContainer');
const AnnouncementContainer = require('./components/AnnouncementContainer');

module.exports = class Notices extends Plugin {
  startPlugin () {
    this.loadStylesheet('style.scss');
    this._patchAnnouncements();
    this._patchToasts();

    const injectedFile = resolve(__dirname, '..', '..', '..', '__injected.txt');
    if (existsSync(injectedFile)) {
      this._welcomeNewUser();
      unlink(injectedFile);
    }

    if (window.GLOBAL_ENV.RELEASE_CHANNEL !== 'canary') {
      this._unsupportedBuild();
    }
  }

  pluginWillUnload () {
    uninject('pc-notices-announcements');
    uninject('pc-notices-toast');
  }

  async _patchAnnouncements () {
    const { base } = await getModule([ 'base', 'container' ]);
    const instance = getOwnerInstance(await waitFor(`.${base.split(' ')[0]}`));
    inject('pc-notices-announcements', instance.__proto__, 'render', (_, res) => {
      res.props.children[1].props.children.unshift(React.createElement(AnnouncementContainer));
      return res;
    });

    instance.forceUpdate();
  }

  async _patchToasts () {
    const { app } = await getModule([ 'app', 'layers' ]);
    const Shakeable = await getModuleByDisplayName('Shakeable');
    inject('pc-notices-toast', Shakeable.prototype, 'render', (_, res) => {
      if (!res.props.children.find(child => child.type && child.type.name === 'ToastContainer')) {
        res.props.children.push(React.createElement(ToastContainer));
      }
      return res;
    });
    forceUpdateElement(`.${app}`);
  }

  _welcomeNewUser () {
    powercord.api.notices.sendAnnouncement('pc-first-welcome', {
      color: 'green',
      message: 'Welcome! Powercord has been successfully injected into your Discord client. Feel free to join our Discord server for announcements, support and more!',
      button: {
        text: 'Join Server',
        onClick: async () => {
          const store = await getModule([ 'getGuilds' ]);
          if (store.getGuilds()[GUILD_ID]) {
            const channel = await getModule([ 'getLastSelectedChannelId' ]);
            const router = await getModule([ 'transitionTo' ]);
            // eslint-disable-next-line new-cap
            router.transitionTo(Routes.CHANNEL(GUILD_ID, channel.getChannelId(GUILD_ID)));
          } else {
            const windowManager = await getModule([ 'flashFrame', 'minimize' ]);
            const { INVITE_BROWSER: { handler: popInvite } } = await getModule([ 'INVITE_BROWSER' ]);
            const oldMinimize = windowManager.minimize;
            windowManager.minimize = () => void 0;
            popInvite({ args: { code: DISCORD_INVITE } });
            windowManager.minimize = oldMinimize;
          }
        }
      }
    });
  }

  _unsupportedBuild () {
    powercord.api.notices.sendAnnouncement('pc-unsupported-build', {
      color: 'orange',
      message: `Powercord does not support the ${window.GLOBAL_ENV.RELEASE_CHANNEL} release of Discord. Please use Canary for best results.`
    });
  }
};
