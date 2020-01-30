const { Plugin } = require('powercord/entities');
const { forceUpdateElement, sleep } = require('powercord/util');
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
    const { textArea } = await getModule([ 'textArea', 'textAreaDisabled' ]);
    const { containerCozy } = await getModule([ 'containerCozy' ]);

    this.state.textAreaEdit = `.${containerCozy.split(' ')[0]} .${textArea}`;
    this.classes = {
      ...await getModule([ 'messages', 'scroller' ])
    };

    while (!getModule([ 'getCurrentUser' ], false).getCurrentUser()) {
      await sleep(100);
    }

    this.registerSettings('pc-clickableEdits', 'Clickable Edits', Settings);
    this.patchMessageContent();
  }

  pluginWillUnload () {
    uninject('pc-clickableEdits-MessageContent');
    forceUpdateElement(this.state.messageQuery, true);
  }

  async patchMessageContent () {
    const messages = `.${this.classes.messages}`;
    const currentUser = (await getModule([ 'getCurrentUser' ])).getCurrentUser();

    const renderMessage = (args, res) => {
      const { childrenMessageContent: { props: { message } } } = args[0];
      if (message.author.id === currentUser.id) {
        res.props.onMouseUp = this.handleMessageEdit(message.channel_id, message.id, message.content);
      }

      return res;
    };

    this.state.messageQuery = messages;

    const Message = await getModule(m => m.default && m.default.displayName === 'Message');
    inject('pc-clickableEdits-MessageContent', Message, 'default', renderMessage);

    Message.default.displayName = 'Message';

    forceUpdateElement(this.state.messageQuery, true);
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
          const { startEditMessage } = await getModule([ 'editMessage' ]);
          startEditMessage(args[0], args[1], args[2]);

          setTimeout(() => {
            const elem = document.querySelector(this.state.textAreaEdit);
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
