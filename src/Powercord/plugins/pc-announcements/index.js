const { resolve } = require('path');
const { existsSync } = require('fs');
const { unlink } = require('fs').promises;
const Plugin = require('powercord/Plugin');
const { shell: { openExternal } } = require('electron');
const { inject, uninject } = require('powercord/injector');
const { React, ReactDOM, getModule } = require('powercord/webpack');
const { DISCORD_INVITE, GUILD_ID } = require('powercord/constants');

const Notice = require('./Notice');

module.exports = class Announcements extends Plugin {
  constructor () {
    super();
    this.Notice = Notice;
    this.notices = [];
  }

  async start () {
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
              getModule([ 'selectGuild' ]).selectGuild(GUILD_ID);
            });
          }
        },
        alwaysDisplay: true
      });
    }

    this.sendNotice({
      id: 'pc-pewdiepie',
      type: Notice.TYPES.RED,
      message: 'PewDiePie is in trouble and he needs your help to defeat T-Series!',
      button: {
        text: 'Subscribe to PewDiePie',
        onClick: () => {
          this.closeNotice('pc-pewdiepie');
          openExternal('https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_AJ5Yw?sub_confirmation=1');
        }
      }
    });
  }

  unload () {
    uninject('pc-custom-notices');
  }

  sendNotice (notice) {
    if (!this.notices.find(n => n.id === notice.id) && (notice.alwaysDisplay || !this.settings.get('dismissed', []).includes(notice.id))) {
      this.notices.push(notice);
      this._renderNotice();
    }
  }

  closeNotice (noticeId) {
    if (this.notices.find(n => n.id === noticeId && !n.alwaysDisplay)) { // make sure that we're only adding notices found without alwaysDisplay to the 'dismissed' array
      this.settings.set('dismissed', [ ...this.settings.get('dismissed', []), noticeId ]);
    }
    this.notices = this.notices.filter(n => n.id !== noticeId);
    this._renderNotice();
  }

  _patchNotices () {
    const NoticeStore = getModule([ 'getNotice' ]);
    inject('pc-custom-notices', NoticeStore, 'getNotice', (_, res) => {
      if (!res) {
        this._renderNotice();
      }
      return res;
    });
  }

  _renderNotice () {
    if (document.querySelector('.pc-wrapper + .pc-flex > .pc-flexChild .pc-notice')) {
      return;
    }

    const element = document.querySelector('.pc-wrapper + .pc-flex .powercord-notice');
    if (element) {
      element.parentElement.remove();
    }

    const noticeContainer = document.querySelector('.pc-wrapper + .pc-flex');
    if (noticeContainer && this.notices.length > 0) {
      const div = document.createElement('div');
      noticeContainer.insertBefore(div, noticeContainer.firstChild);

      const notice = this.notices[this.notices.length - 1];
      ReactDOM.render(
        React.createElement(Notice, {
          notice,
          onClose: () => this.closeNotice(notice.id)
        }), div
      );
    }
  }
};
