const Plugin = require('powercord/Plugin');
const { getModule, channels, constants: { Routes, APP_URL_PREFIX } } = require('powercord/webpack');
const emojiStore = getModule([ 'getGuildEmoji' ]);

module.exports = class EmojiUtility extends Plugin {
  getEmojiRegex () {
    return /^<a?:([a-zA-Z0-9_]+):([0-9]+)>$/;
  }

  getGuildUrl (guild) {
    let selectedChannel = channels.getSelectedChannelState()[guild.id];
    if (!selectedChannel) {
      /* I am not sure if it can get here but just to be sure */
      selectedChannel = guild.systemChannelId;
    }

    return APP_URL_PREFIX + Routes.CHANNEL(guild.id, selectedChannel); // eslint-disable-line new-cap
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
          if (args.length === 0) {
            return {
              send: false,
              result: {
                type: 'rich',
                description: 'Please provide an emote',
                color: 16711680
              }
            };
          }

          const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);

          const foundEmojis = [];
          const notFoundEmojis = [];

          for (const argument of args) {
            const matcher = argument.match(this.getEmojiRegex());
            if (matcher) {
              const emoji = emojis.find(e => e.id === matcher[2]);

              if (emoji) {
                const guild = getModule([ 'getGuild' ]).getGuild(emoji.guildId);

                if (args.length === 1) {
                  return {
                    send: false,
                    result: {
                      type: 'rich',
                      description: `${argument} is from **[${guild.name}](${this.getGuildUrl(guild)})**`,
                      color: 65280,
                      footer: {
                        text: `Guild: ${guild.id}`
                      }
                    }
                  };
                }

                foundEmojis.push({
                  name: argument,
                  emoji,
                  guild
                });

                continue;
              }

              if (args.length === 1) {
                return {
                  send: false,
                  result: {
                    type: 'rich',
                    description: `Could not find emote ${argument}`,
                    color: 16711680
                  }
                };
              }
            }

            if (args.length === 1) {
              return {
                send: false,
                result: {
                  type: 'rich',
                  description: `**${argument}** is not a custom emote`,
                  color: 16711680
                }
              };
            }

            notFoundEmojis.push(argument);
          }

          let description = '';
          for (const found of foundEmojis) {
            description += `${found.name} is from **[${found.guild.name}](${this.getGuildUrl(found.guild)})**\n`;
          }

          return {
            send: false,
            result: {
              type: 'rich',
              description: description.trim(),
              color: 65280,
              footer: notFoundEmojis.length > 0 ? { text: `${notFoundEmojis.length} of the provided arguments ${notFoundEmojis.length === 1 ? 'is not a custom emote' : 'are not custom emotes'}` } : null
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
          if (argument.length === 0) {
            return {
              send: false,
              result: {
                type: 'rich',
                description: 'Please provide an emote name',
                color: 16711680
              }
            };
          }

          const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);

          const foundEmojis = emojis.filter(emoji => emoji.name.toLowerCase().includes(argument));
          if (foundEmojis.length > 0) {
            const emojisAsString = foundEmojis.map(emoji => `<${(emoji.animated ? 'a' : '')}:${emoji.name}:${emoji.id}>`).join('');
            if (emojisAsString.length > 2000) {
              return {
                send: false,
                result: `That is more than 2000 characters, let me send that locally instead!\n${emojisAsString}`
              };
            }

            return {
              send: true,
              result: emojisAsString
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
