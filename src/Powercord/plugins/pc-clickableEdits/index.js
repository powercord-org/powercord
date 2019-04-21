const { Plugin } = require('powercord/entities');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { contextMenu, getModule, React } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

const Settings = require('./Settings');

class ClickableEdits extends Plugin {
  startPlugin () {
    this.patchMessageContent();
    this.registerSettings('pc-clickableEdits', 'Clickable Edits', () =>
      React.createElement(Settings, {
        settings: this.settings
      })
    );
  }

  pluginWillUnload () {
    uninject('pc-clickableEdits-MessageContent');
  }

  async patchMessageContent () {
    const _this = this;

    const messageClasses = await getModule([ 'messageCompact', 'messageCozy' ]);
    const messageQuery = `.${messageClasses.message.replace(/ /g, '.')}`;

    const instance = getOwnerInstance(await waitFor(messageQuery));
    const currentUser = (await getModule([ 'getCurrentUser' ])).getCurrentUser();

    function renderMessage (_, res) {
      const { message, channel } = this.props;

      if (message.author.id === currentUser.id) {
        res.props.onMouseUp = _this.handleMessageEdit(channel.id, message.id, message.content);
      }

      return res;
    }

    inject('pc-clickableEdits-MessageContent', instance.__proto__, 'render', renderMessage);

    this.forceUpdate(messageQuery);
  }

  handleMessageEdit (channelId, messageId, content) {
    return async (e) => {
      const shiftKey = e.shiftKey &&
        e.button === (this.settings.get('rightClickEdits', false)
          ? 2
          : 0) && e.detail === 1;
      const doubleClick = e.button === (this.settings.get('rightClickEdits', false) ? 2 : 0) &&
        e.detail > 1;

      let args = [ channelId, messageId, this.settings.get('clearContent', false) ? '' : content ];

      const dualControl = (this.settings.get('dualControlEdits', false) && shiftKey
        ? args = [ channelId, messageId, '' ]
        : doubleClick
          ? args = [ channelId, messageId, content ]
          : false);

      if (this.settings.get('dualControlEdits', false) ? dualControl : this.settings.get('useShiftKey', false) ? shiftKey : doubleClick) {
        if (e.target.className && e.target.className.includes('pc-markup')) {
          const editMessage = (await getModule([ 'editMessage' ])).startEditMessage;
          editMessage(args[0], args[1], args[2]);

          setTimeout(() => {
            const elem = document.getElementsByClassName('pc-textAreaEdit')[0];
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

  /*
   * DISCLAIMER: the following method was taken from .intrnl#6380's 'blackboxTags'
   * plug-in - this section of code does not belong to me.
   */
  forceUpdate (query) {
    const elements = [
      ...document.querySelectorAll(query)
    ];

    for (const elem of elements) {
      const instance = getOwnerInstance(elem);
      instance.forceUpdate();
    }
  }
}

module.exports = ClickableEdits;
