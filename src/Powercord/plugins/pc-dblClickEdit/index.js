const { Plugin } = require('powercord/entities');
const { getOwnerInstance, waitFor } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

class DblClickEdit extends Plugin {
  startPlugin () {
    this.patchMessageContent();
  }

  pluginWillUnload () {
    uninject('pc-dblClickEdit-MessageContent');
  }

  async patchMessageContent () {
    const _this = this;

    const messageClasses = await getModule([ 'messageCompact', 'messageCozy' ]);
    const messageQuery = `.${messageClasses.message.replace(/ /g, '.')}`;

    const instance = getOwnerInstance(await waitFor(messageQuery));
    const currentUser = await getModule([ 'getCurrentUser' ]).getCurrentUser();

    function renderMessage (_, res) {
      const { message, channel } = this.props;

      if (message.author.id === currentUser.id) {
        res.props.onDoubleClick = _this.handleMessageEdit(channel.id, message.id, message.content);
      }

      return res;
    }

    inject('pc-dblClickEdit-MessageContent', instance.__proto__, 'render', renderMessage);

    this.forceUpdate(messageQuery);
  }

  handleMessageEdit (channelId, messageId, content) {
    return async () => {
      const { startEditMessage } = await getModule([ 'editMessage' ]);
      startEditMessage(channelId, messageId, content);
    };
  }

  /*
   * DISCLAIMER: the following method was taken from .intrnl#6380's 'twitchEmotes'
   * plug-in - this snippet of code does not belong to me.
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

module.exports = DblClickEdit;
