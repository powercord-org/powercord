const { Plugin } = require('powercord/entities');
const { forceUpdateElement, getOwnerInstance, waitFor } = require('powercord/util');
const { contextMenu, getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./Settings');

module.exports = class ClickableEdits extends Plugin {
  constructor (props) {
    super(props);

    this.state = {
      messageQuery: ''
    };
  }

  async startPlugin () {
    this.state.messageClasses = {
      textAreaEdit: (await getModule([ 'textAreaEdit' ])).textAreaEdit
    };

    this.patchMessageContent();
    this.registerSettings('pc-clickableEdits', 'Clickable Edits', Settings);
  }

  pluginWillUnload () {
    uninject('pc-clickableEdits-MessageContent');
    forceUpdateElement(this.state.messageQuery, true);
  }

  async patchMessageContent () {
    const _this = this;

    const messageClasses = (await getModule([ 'container', 'messageCompact' ]));
    const messageQuery = `.${messageClasses.content.replace(/ /g, '.')}`;

    const instance = getOwnerInstance(await waitFor(messageQuery));
    const currentUser = (await getModule([ 'getCurrentUser' ])).getCurrentUser();

    function renderMessage (_, res) {
      const { message, channel } = this.props;

      if (message && message.author.id === currentUser.id) {
        res.props.onMouseUp = _this.handleMessageEdit(channel.id, message.id, message.content);
      }

      return res;
    }

    inject('pc-clickableEdits-MessageContent', instance.__proto__, 'render', renderMessage);

    forceUpdateElement(messageQuery, true);

    this.state.messageQuery = messageQuery;
  }

  handleMessageEdit (channelId, messageId, content) {
    return async (e) => {
      const shiftKey = e.shiftKey &&
        e.button === (this.settings.get('rightClickEdits', false)
          ? 2
          : 0) && e.detail === 1;
      const doubleClick = e.button === (this.settings.get('rightClickEdits', false)
        ? 2
        : 0) && e.detail > 1;

      let args = [ channelId, messageId, this.settings.get('clearContent', false) ? '' : content ];

      const dualControl = (this.settings.get('dualControlEdits', false) && shiftKey
        ? args = [ channelId, messageId, '' ]
        : doubleClick
          ? args = [ channelId, messageId, content ]
          : false);

      if (this.settings.get('dualControlEdits', false) ? dualControl : this.settings.get('useShiftKey', false) ? shiftKey : doubleClick) {
        if (e.target.className && (e.target.className.includes('markup') || e.target.className.includes('container'))) {
          const { textAreaEdit } = this.state.messageClasses;
          const { startEditMessage: editMessage } = (await getModule([ 'editMessage' ]));
          editMessage(args[0], args[1], args[2]);

          setTimeout(() => {
            const elem = document.getElementsByClassName(textAreaEdit.replace(/ /g, '.'))[0];
            if (elem) {
              elem.focus();
              elem.setSelectionRange(elem.value.length, elem.value.length);
            }

            contextMenu.closeContextMenu();
          }, 100);
        }
      }
    };
  }
};
