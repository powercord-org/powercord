const { Plugin } = require('powercord/entities');
const { getModule, messages } = require('powercord/webpack');
const { forceUpdateElement, sleep } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./Settings');

module.exports = class ClickableEdits extends Plugin {
  constructor () {
    super();

    this.classes = {
      textArea: getModule([ 'textArea', 'textAreaDisabled' ], false),
      channelTextArea: getModule([ 'message', 'divider' ], false),
      messages: getModule([ 'messages', 'scroller' ], false)
    };

    Object.keys(this.classes).forEach(key =>
      this.classes[key] = `.${this.classes[key][key]}`
    );
  }

  get currentUser () {
    return window.__SENTRY__.hub.getScope()._user;
  }

  async startPlugin () {
    while (!this.currentUser.id) {
      await sleep(1000);
    }

    this.registerSettings('pc-clickableEdits', 'Clickable Edits', Settings);
    this.patchMessageContent();
  }

  pluginWillUnload () {
    uninject('clickableEdits-message');
    forceUpdateElement(this.classes.messages, true);
  }

  async patchMessageContent () {
    const renderMessage = (args, res) => {
      const { childrenMessageContent: { props: { message } } } = args[0];
      if (message && message.author.id === this.currentUser.id) {
        res.props.onMouseUp = this.handleMessageEdit(message.channel_id, message.id, message.content);
      }

      return res;
    };

    const Message = await getModule(m => m.default && m.default.displayName === 'Message');
    inject('clickableEdits-message', Message, 'default', renderMessage);

    Message.default.displayName = 'Message';

    forceUpdateElement(this.classes.messages, true);
  }

  get (key) {
    return this.settings.get(key, false);
  }

  handleMessageEdit (channel_id, message_id, content) {
    const shiftKey = (e) => e.shiftKey && e.button === (this.get('rightClickEdits') ? 2 : 0) && e.detail === 1;
    const doubleClick = (e) => e.button === (this.get('rightClickEdits') ? 2 : 0) && e.detail > 1;

    let args = [ channel_id, message_id, !this.get('clearContent') ? content : '' ];
    const dualControl = (e) => this.get('dualControlEdits') && shiftKey(e)
      ? args = [ channel_id, message_id, '' ]
      : doubleClick(e)
        ? args = [ channel_id, message_id, content ]
        : false;

    return (e) => {
      if (this.get('dualControlEdits') ? dualControl(e) : this.get('useShiftKey') ? shiftKey(e) : doubleClick(e)) {
        if (e.target.className && (e.target.className.includes('markup') || e.target.className.includes('container'))) {
          messages.startEditMessage(...args);
        }
      }
    };
  }
};
