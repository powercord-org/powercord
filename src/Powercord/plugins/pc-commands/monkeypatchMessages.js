const { getModule, messages, channels: { getChannelId } } = require('powercord/webpack');
const { receiveMessage } = messages;

module.exports = async function monkeypatchMessages () {
  const { BOT_AVATARS } = await getModule([ 'BOT_AVATARS' ]);
  const { createBotMessage } = await getModule([ 'createBotMessage' ]);

  // create a new `BOT_AVATARS` key called "powercord" which we'll later use to replace Clyde. >:D
  BOT_AVATARS.powercord = 'https://avatars.githubusercontent.com/powercord-org?s=128';

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
      const appearance = result.appearance || {};

      if (powercord.settings.get('replaceClyde', true)) {
        receivedMessage.author.username = appearance.username || 'Powercord';
        receivedMessage.author.avatar = 'powercord';

        if (typeof appearance.avatar === 'object') {
          if (![ 'name', 'url' ].every(key => appearance.avatar.hasOwnProperty(key))) {
            console.warn('%c[Powercord:Plugin:Commands]', 'color: #257dd4', `Command "${cmd}" is missing the <name> and/or <url> key which are/is mandatory for fetching and returning the result avatar; falling back to default.`);
          } else {
            BOT_AVATARS[appearance.avatar.name] = appearance.avatar.url;
            receivedMessage.author.avatar = appearance.avatar.name;
          }
        }
      }

      if (typeof result.result === 'string') {
        receivedMessage.content = result.result;
      } else {
        receivedMessage.embeds.push(result.result);
      }

      return (receiveMessage(receivedMessage.channel_id, receivedMessage), delete BOT_AVATARS[(appearance.avatar && appearance.avatar.name)]);
    }

    return sendMessage(id, message, ...params);
  })(this.oldSendMessage = messages.sendMessage);
};
