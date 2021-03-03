const { Plugin } = require('powercord/entities');
const { getModule, messages } = require('powercord/webpack');
const { forceUpdateElement } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./Settings');

module.exports = class ClickableEdits extends Plugin {
  constructor () {
    super();

    this.classes = {
      messages: getModule([ 'messages', 'scroller' ], false),
      messageContent: getModule([ 'wrapper', 'username' ], false),
      container: getModule([ 'container', 'embedWrapper' ], false),
      markup: getModule([ 'markup' ], false)
    };

    Object.keys(this.classes).forEach(key =>
      this.classes[key] = `.${this.classes[key][key]}`
    );
  }

  get currentUser () {
    return window.__SENTRY__.hub.getScope()._user;
  }

  async startPlugin () {
    powercord.api.settings.registerSettings('pc-clickableEdits', {
      category: this.entityID,
      label: 'Clickable Edits',
      render: Settings
    });

    this.patchMessageContent();
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings('pc-clickableEdits');
    uninject('clickableEdits-message');
    forceUpdateElement(this.classes.messages);
  }

  async patchMessageContent () {
    const renderMessage = (args, res) => {
      const { childrenMessageContent: { props: { message } } } = args[0];
      if (message && message.author.id === this.currentUser.id) {
        res.props.children.props.onMouseUp = this.handleMessageEdit(message.channel_id, message.id, message.content);
      }

      return res;
    };

    const Message = await getModule(m => (m.__powercordOriginal_default || m.default)?.toString().includes('childrenRepliedMessage'));
    inject('clickableEdits-message', Message, 'default', renderMessage);
    Message.default.displayName = 'Message';

    forceUpdateElement(this.classes.messages);
  }

  handleMessageEdit (channel_id, message_id, content) {
    const get = (key) => this.settings.get(key, false);
    const shiftKey = (e) => e.shiftKey && e.button === (get('rightClickEdits') ? 2 : 0) && e.detail === 1;
    const doubleClick = (e) => e.button === (get('rightClickEdits') ? 2 : 0) && e.detail > 1;

    let args = [ channel_id, message_id, !get('clearContent') ? content : '' ];
    const dualControl = (e) => get('dualControlEdits') && shiftKey(e)
      ? args = [ channel_id, message_id, '' ]
      : doubleClick(e)
        ? args = [ channel_id, message_id, content ]
        : false;

    return (e) => {
      if (get('dualControlEdits') ? dualControl(e) : get('useShiftKey') ? shiftKey(e) : doubleClick(e)) {
        if (e.target.closest(`${this.classes.markup}${this.classes.messageContent}`) || e.target.closest(this.classes.container)) {
          messages.startEditMessage(...args);
        }
      }
    };
  }
};
