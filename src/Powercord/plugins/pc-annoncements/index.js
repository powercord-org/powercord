const Plugin = require('powercord/Plugin');
const { inject, uninject } = require('powercord/injector');
const { React, ReactDOM, getModule } = require('powercord/webpack');
const Notice = require('./Notice');

module.exports = class Lol extends Plugin {
  start () {
    this._patchNotices();
  }

  unload () {
    uninject('pc-custom-notices');
  }

  _patchNotices () {
    const NoticeStore = getModule([ 'getNotice' ]);
    inject('pc-custom-notices', NoticeStore, 'getNotice', (_, res) => { // eslint-disable-line
      if (!res) {
        /*
         * ReactDOM.render(
         * React.createElement(Notice, {
         * notice: {
         * type: 'BLURPLE_GRADIENT',
         * message: 'Subscribe to pewdiepie',
         * button: {
         * text: 'Go to channel',
         * onClick: () => void 0
         * }
         * }
         * }),
         * document.querySelector('.pc-guildsWrapper + .pc-flex > .pc-flexChild div')
         * );
         */
      }
      return res;
    });
  }
};
