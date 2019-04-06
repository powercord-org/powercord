const { resolve } = require('path');
const { existsSync } = require('fs');
const { unlink } = require('fs').promises;
const { Plugin } = require('powercord/entities');
const { React, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { DISCORD_INVITE, GUILD_ID } = require('powercord/constants');

const Notice = require('./Notice');

module.exports = class Announcements extends Plugin {
  constructor () {
    super();
    this.Notice = Notice;
    this.notices = [];
  }

  async startPlugin () {
    this._patchNotices();
    const injectedFile = resolve(__dirname, '..', '..', '..', '__injected.txt');
    if (existsSync(injectedFile)) {
      await unlink(injectedFile);
      this.sendNotice({
        id: 'pc-first-welcome',
        type: Notice.TYPES.GREEN,
        message: 'Welcome! Powercord has been successfully injected into your Discord client. Feel free to join our Discord server for announcements, support and more!',
        button: {
          text: 'Join Server',
          onClick: () => {
            this.closeNotice('pc-first-welcome');
            getModule([ 'acceptInvite' ]).acceptInvite(DISCORD_INVITE, {}, () => {
              getModule([ 'flushSelection' ]).selectGuild(GUILD_ID);
            });
          }
        },
        alwaysDisplay: true
      });
    }
  }

  pluginWillUnload () {
    uninject('pc-custom-notices');
  }

  sendNotice (notice) {
    if (!this.notices.find(n => n.id === notice.id) && (notice.alwaysDisplay || !this.settings.get('dismissed', []).includes(notice.id))) {
      this.notices.push(notice);
      this._forceUpdate();
    }
  }

  closeNotice (noticeId) {
    if (this.notices.find(n => n.id === noticeId && !n.alwaysDisplay)) { // make sure that we're only adding notices found without alwaysDisplay to the 'dismissed' array
      this.settings.set('dismissed', [ ...this.settings.get('dismissed', []), noticeId ]);
    }
    this.notices = this.notices.filter(n => n.id !== noticeId);
    this._forceUpdate();
  }

  async _patchNotices () {
    const Component = getOwnerInstance(await waitFor('.pc-base > .pc-flex'));
    inject('pc-custom-notices', Component.__proto__, 'render', (_, res) => {
      res.props.children[1].props.children.unshift(this._renderNotice());
      return res;
    });
  }

  async _forceUpdate () {
    getOwnerInstance(await waitFor('.pc-base > .pc-flex')).forceUpdate();
  }

  _renderNotice () {
    if (this.notices.length > 0) {
      const notice = this.notices[this.notices.length - 1];
      return React.createElement(Notice, {
        notice,
        onClose: () => this.closeNotice(notice.id)
      });
    }
    return null;
  }
};
