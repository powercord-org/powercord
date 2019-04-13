const { messages, channels: { getChannelId } } = require('powercord/webpack');
const { createBotMessage, receiveMessage } = messages;

module.exports = async function monkeypatchMessages () {
  messages.sendMessage = (sendMessage => async (id, message, ...params) => {
    if (!message.content.startsWith(powercord.api.commands.prefix)) {
      return sendMessage(id, message, ...params);
    }

    const [ cmd, ...args ] = message.content.slice(powercord.api.commands.prefix.length).split(' ');
    const command = powercord.api.commands.commands.find(c => [ c.command, ...c.aliases ].includes(cmd));
    if (!command) {
      return sendMessage(id, message, ...params);
    }

    const result = await command.func(args, this);
    if (!result) {
      return;
    }

    if (result.send) {
      message.content = result.result;
    } else {
      const receivedMessage = createBotMessage(getChannelId(), '');

      if (typeof result.result === 'string') {
        receivedMessage.content = result.result;
      } else {
        receivedMessage.embeds.push(result.result);
      }

      return receiveMessage(receivedMessage.channel_id, receivedMessage);
    }

    return sendMessage(id, message, ...params);
  })(this.oldSendMessage = messages.sendMessage);
};
