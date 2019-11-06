const { resolve } = require('path');
const { existsSync } = require('fs');
const { unlink } = require('fs').promises;
const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');
const { DISCORD_INVITE } = require('powercord/constants');

const ToastContainer = require('./components/ToastContainer');
const AnnouncementContainer = require('./components/AnnouncementContainer');

module.exports = class Toasts extends Plugin {
  startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
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
    const { app } = await getModule([ 'app' ]);
    const instance = getOwnerInstance(await waitFor(`.${app.split(' ')[0]}`));
    inject('pc-notices-toast', instance.__proto__, 'render', (_, res) => {
      res.props.children.push(React.createElement(ToastContainer));
      return res;
    });

    instance.forceUpdate();
  }

  _welcomeNewUser () {
    this.sendAnnouncement('pc-first-welcome', {
      color: 'green',
      message: 'Welcome! Powercord has been successfully injected into your Discord client. Feel free to join our Discord server for announcements, support and more!',
      button: {
        text: 'Join Server',
        onClick: async () => {
          const windowManager = await getModule([ 'flashFrame', 'minimize' ]);
          const { INVITE_BROWSER: { handler: popInvite } } = await getModule([ 'INVITE_BROWSER' ]);
          const oldMinimize = windowManager.minimize;
          windowManager.minimize = () => void 0;
          popInvite({ args: { code: DISCORD_INVITE } });
          windowManager.minimize = oldMinimize;
        }
      }
    });
  }

  _unsupportedBuild () {
    this.sendAnnouncement('pc-unsupported-build', {
      color: 'orange',
      message: `Powercord does not support the ${window.GLOBAL_ENV.RELEASE_CHANNEL} release of Discord. Please use Canary for best results.`
    });
  }
};
