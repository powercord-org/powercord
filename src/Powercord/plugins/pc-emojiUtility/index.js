const Plugin = require('powercord/Plugin');
const { getModule } = require('powercord/webpack');
const emojiStore = getModule([ 'getGuildEmoji' ]);

module.exports = class EmojiUtility extends Plugin {
  getEmojiRegex () {
    return /^<a?:([a-zA-Z0-9_]+):([0-9]+)>$/;
  }

  start () {
    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'find',
        'Find the server an emote is from',
        '{c} [emote]',
        (args) => {
          const argument = args.join(' ');

          const matcher = argument.match(this.getEmojiRegex());
          if (matcher) {
            const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);
            const emoji = emojis.find(emoji => emoji.id === matcher[2]);

            if (emoji) {
              return {
                send: false,
                result: `${argument} is from ${getModule([ 'getGuild' ]).getGuild(emoji.guildId).name} (${emoji.guildId})`
              };
            }
            return {
              send: false,
              result: `Could not find emote ${argument}`
            };
          }
          return {
            send: false,
            result: `**${argument}** is not an emote`
          };
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'massemote',
        'Send all emotes containing the specified name',
        '{c} [emote name]',
        (args) => {
          const argument = args.join(' ').toLowerCase();
          const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);

          const foundEmojis = emojis.filter(emoji => emoji.name.toLowerCase().includes(argument));
          if (foundEmojis.length > 0) {
            return {
              send: true,
              result: foundEmojis.map(emoji => `<${(emoji.animated ? 'a' : '') + emoji.allNamesString + emoji.id}>`).join('')
            };
          }
          return {
            send: false,
            result: `Could not find any emotes containing **${argument}**`
          };
        }
      );
  }
};
