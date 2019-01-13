const Plugin = require('powercord/Plugin');
const { getModule, channels, constants } = require('powercord/webpack');
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
        'findemote',
        'Find the server an emote is from',
        '{c} [emote]',
        (args) => {
          const argument = args.join(' ');
          if (argument.length == 0) {
            return {
              send: false,
              result: {
                type: 'rich',
                description: 'Please provide an emote',
                color: 16711680
              }
            };
          }

          const matcher = argument.match(this.getEmojiRegex());
          if (matcher) {
            const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);
            const emoji = emojis.find(emoji => emoji.id === matcher[2]);

            if (emoji) {
              const guild = getModule([ 'getGuild' ]).getGuild(emoji.guildId);

              let selectedChannel = channels.getSelectedChannelState()[guild.id];
              if (!selectedChannel) {
                /* I am not sure if it can get here but just to be sure */
                selectedChannel = guild.systemChannelId;
              }

              const url = `https://${constants.API_HOST}/channels/${guild.id}/${selectedChannel}`;

              return {
                send: false,
                result: {
                  type: 'rich',
                  description: `${argument} is from **[${guild.name}](${url})**`,
                  color: 65280,
                  footer: {
                    text: `Guild: ${guild.id}`
                  }
                }
              };
            }
            return {
              send: false,
              result: {
                type: 'rich',
                description: `Could not find emote ${argument}`,
                color: 16711680
              }
            };
          }
          return {
            send: false,
            result: {
              type: 'rich',
              description: `**${argument}** is not a custom emote`,
              color: 16711680
            }
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
            result: {
              type: 'rich',
              description: `Could not find any emotes containing **${argument}**`,
              color: 16711680
            }
          };
        }
      );
  }
};
