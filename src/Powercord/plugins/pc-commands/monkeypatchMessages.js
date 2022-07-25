const { getModule, channels } = require('powercord/webpack');

module.exports = async function monkeypatchMessages () {
  const messages = await getModule([ 'sendMessage', 'editMessage' ]);

  const { BOT_AVATARS } = await getModule([ 'BOT_AVATARS' ]);
  const { createBotMessage } = await getModule([ 'createBotMessage' ]);

  // create a new `BOT_AVATARS` key called "replugged" which we'll later use to replace Clyde. >:D
  BOT_AVATARS.replugged = 'https://cdn.discordapp.com/icons/1000926524452647132/97617aed9d2613abd4f32f3f0aef695c.png?size=1024';

  messages.sendMessage = (sendMessage => async (id, message, ...params) => {
    if (!message.content.startsWith(powercord.api.commands.prefix)) {
      return sendMessage(id, message, ...params).catch(() => void 0);
    }

    const [ cmd, ...args ] = message.content.slice(powercord.api.commands.prefix.length).split(' ');
    const command = powercord.api.commands.find(c => [ c.command.toLowerCase(), ...(c.aliases?.map(alias => alias.toLowerCase()) || []) ].includes(cmd.toLowerCase()));
    if (!command) {
      return sendMessage(id, message, ...params).catch(() => void 0);
    }

    let result;
    try {
      result = await command.executor(args, this);
    } catch (e) {
      result = {
        send: false,
        result: `An error occurred while executing the command: ${e.message}.\nCheck the console for more details.`
      };

      console.error('An error occurred while executing command %s: %o', command.command, e);
    }

    if (!result || !result.result) {
      return;
    }

    if (result.send) {
      message.content = result.result;
    } else {
      const receivedMessage = createBotMessage({
        channelId: channels.getChannelId(),
        content: ''
      });

      if (powercord.settings.get('replaceClyde', true)) {
        // noinspection JSPrimitiveTypeWrapperUsage
        receivedMessage.author.username = result.username || 'Replugged';
        // noinspection JSPrimitiveTypeWrapperUsage
        receivedMessage.author.avatar = 'replugged';

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
      return (messages.receiveMessage(channels.getChannelId(), receivedMessage), delete BOT_AVATARS[result.avatar_url]);
    }

    return sendMessage(id, message, ...params).catch(() => void 0);
  })(this.oldSendMessage = messages.sendMessage);
};
