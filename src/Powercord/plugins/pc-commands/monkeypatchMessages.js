const { getModule, messages, channels: { getChannelId } } = require('powercord/webpack');
const { receiveMessage } = messages;

module.exports = async function monkeypatchMessages () {
  const { BOT_AVATARS } = await getModule([ 'BOT_AVATARS' ]);
  const { createBotMessage } = await getModule([ 'createBotMessage' ]);

  // create a new `BOT_AVATARS` key called "powercord" which we'll later use to replace Clyde. >:D
  BOT_AVATARS.powercord = 'https://powercord.dev/assets/powercord.png';

  messages.sendMessage = (sendMessage => async (id, message, ...params) => {
    if (!message.content.startsWith(powercord.api.commands.prefix)) {
      return sendMessage(id, message, ...params);
    }

    const [ cmd, ...args ] = message.content.slice(powercord.api.commands.prefix.length).split(' ');
    const command = powercord.api.commands.commands.find(c => [ c.command, ...c.aliases ].includes(cmd.toLowerCase()));
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

      if (powercord.settings.get('replaceClyde', true)) {
        // noinspection JSPrimitiveTypeWrapperUsage
        receivedMessage.author.username = result.username || 'Powercord';
        // noinspection JSPrimitiveTypeWrapperUsage
        receivedMessage.author.avatar = 'powercord';

        if (result.avatar_url) {
          BOT_AVATARS[result.username] = result.avatar_url;
          // noinspection JSPrimitiveTypeWrapperUsage
          receivedMessage.author.avatar = result.username;
        }
      }

      if (typeof result.result === 'string') {
        receivedMessage.content = result.result;
      } else {
        receivedMessage.embeds.push(result.result);
      }

      // noinspection CommaExpressionJS
      return (receiveMessage(receivedMessage.channel_id, receivedMessage), delete BOT_AVATARS[result.avatar_url]);
    }

    return sendMessage(id, message, ...params);
  })(this.oldSendMessage = messages.sendMessage);
};
