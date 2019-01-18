const Plugin = require('powercord/Plugin');

const {
  getModuleByDisplayName,
  getModule,
  React,
  channels: {
    getSelectedChannelState,
    getChannelId
  },
  constants: {
    Routes,
    APP_URL_PREFIX,
    Permissions // eslint-disable-line no-shadow
  },
  messages: {
    createBotMessage,
    receiveMessage
  }
} = require('powercord/webpack');

const { ContextMenu: { Submenu } } = require('powercord/components');

const { inject } = require('powercord/injector');
const { open: openModal } = require('powercord/modal');

const { writeFile } = require('fs').promises;
const { existsSync } = require('fs');

const { get } = require('powercord/http');
const { extname, resolve } = require('path');
const { parse } = require('url');

const emojiStore = getModule([ 'getGuildEmoji' ]);

const { getGuild } = getModule([ 'getGuild' ]);
const { uploadEmoji } = getModule([ 'uploadEmoji' ]);
const { getGuilds } = getModule([ 'getGuilds' ]);
const { getChannel } = getModule([ 'getChannel' ]);
const { getGuildPermissions } = getModule([ 'getGuildPermissions' ]);
const { transitionTo } = getModule([ 'transitionTo' ]);

const { clipboard } = require('electron');

const Settings = require('./Settings.jsx');

module.exports = class EmojiUtility extends Plugin {
  getEmojiRegex () {
    return /^<a?:([a-zA-Z0-9_]+):([0-9]+)>$/;
  }

  getEmojiUrlRegex () {
    return /https:\/\/cdn.discordapp.com\/emojis\/(\d+)/;
  }

  getGuildRoute (guildId) {
    const selectedChannelId = getSelectedChannelState()[guildId];

    /* eslint-disable new-cap */
    return selectedChannelId
      ? Routes.CHANNEL(guildId, selectedChannelId)
      : Routes.GUILD(guildId);
    /* eslint-enable new-cap */
  }

  getGuildUrl (guildId) {
    return APP_URL_PREFIX + this.getGuildRoute(guildId);
  }

  getFullEmoji (emoji) {
    return `<${(emoji.animated ? 'a' : '')}:${emoji.name}:${emoji.id}>`;
  }

  sendBotMessage (content) {
    const receivedMessage = createBotMessage(getChannelId(), '');

    if (typeof content === 'string') {
      receivedMessage.content = content;
    } else {
      receivedMessage.embeds.push(content);
    }

    return receiveMessage(receivedMessage.channel_id, receivedMessage);
  }

  reply (content, embed) {
    this.sendBotMessage(
      this.settings.get('useEmbeds')
        ? Object.assign({
          type: 'rich',
          description: content
        }, embed)
        : content
    );
  }

  replySuccess (content, embed) {
    this.reply(content, Object.assign({ color: 65280 }, embed));
  }

  replyError (content, embed) {
    this.reply(content, Object.assign({ color: 16711680 }, embed));
  }

  async getImageEncoded (image) {
    const extension = extname(parse(image).pathname).substring(1);
    const { raw } = await get(image);

    return `data:image/${extension};base64,${raw.toString('base64')}`;
  }

  getGuildByIdOrName (input) {
    let guild = getGuild(input);
    if (!guild) {
      input = input.toLowerCase();

      guild = Object.values(getGuilds()).find(g => g.name.toLowerCase().includes(input));
    }

    return guild;
  }

  findEmojisForCommand (args) {
    args = [ ...new Set(args) ];

    if (args.length === 0) {
      return this.replyError('Please provide an emote');
    }

    const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);

    const foundEmojis = [];
    const notFoundEmojis = [];

    for (const argument of args) {
      const matcher = argument.match(this.getEmojiRegex());
      if (matcher) {
        const emoji = emojis.find(e => e.id === matcher[2]);

        if (emoji) {
          const guild = getGuild(emoji.guildId);
          emoji.guild = guild;

          foundEmojis.push(emoji);

          continue;
        }

        if (args.length === 1) {
          return this.replyError(`Could not find emote ${argument}`);
        }
      }

      if (args.length === 1) {
        return this.replyError(`**${argument}** is not a custom emote`);
      }

      notFoundEmojis.push(argument);
    }

    return {
      foundEmojis,
      notFoundEmojis
    };
  }

  hasPermission (guildId, permission) {
    const permissions = getGuildPermissions(guildId);

    return permissions && (permissions & permission) !== 0;
  }

  createFakeEmoji (id, name, url) {
    return {
      id,
      name,
      url,
      fake: true
    };
  }

  start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));

    const _this = this;

    const MessageContextMenu = getModuleByDisplayName('MessageContextMenu');
    inject('pc-emojiUtility-emojiContext', MessageContextMenu.prototype, 'render', function (args, res) { // eslint-disable-line func-names
      const { target } = this.props;
      if (target.classList.contains('emoji')) {
        const matcher = target.src.match(_this.getEmojiUrlRegex());
        if (matcher) {
          let emoji = Object.values(emojiStore.getGuilds()).flatMap(g => g.emojis).find(e => e.id === matcher[1]);
          if (emoji) {
            emoji.fake = false;
          } else {
            emoji = _this.createFakeEmoji(matcher[1], target.alt.substring(1, target.alt.length - 1), target.src);
          }

          const getCloneableGuilds = () => {
            const items = [];
            const clonableGuilds = Object.values(getGuilds()).filter(guild => _this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS));

            const onClick = async (guild) => {
              try {
                await uploadEmoji(guild.id, await _this.getImageEncoded(emoji.url), emoji.name);

                _this.replySuccess(`Cloned emote ${_this.getFullEmoji(emoji)} to **${guild.name}**`);
              } catch (error) {
                console.error(error);

                _this.replyError('Failed to clone emote, check the console for more information', {
                  description: 'Failed to clone emote',
                  footer: {
                    text: 'Check the console for more information'
                  }
                });
              }
            };

            for (const guild of clonableGuilds) {
              items.push({
                type: 'button',
                name: guild.name,
                onClick: () => onClick(guild)
              });
            }

            return items;
          };

          const getFeatures = () => {
            const features = [];

            features.push({
              type: 'submenu',
              name: 'Clone',
              hint: 'to',
              getItems: getCloneableGuilds
            });

            features.push({
              type: 'button',
              name: 'Save',
              onClick: async () => {
                if (!_this.settings.get('filePath')) {
                  _this.replyError('Please set your save directory in the settings');

                  return;
                }

                if (!existsSync(_this.settings.get('filePath'))) {
                  _this.replyError('The specified save directory does no longer exist, please update it in the settings');

                  return;
                }

                try {
                  const name = _this.settings.get('includeIdForSavedEmojis') ? `${emoji.name} (${emoji.id})` : emoji.name;

                  await writeFile(resolve(_this.settings.get('filePath'), name + extname(parse(emoji.url).pathname)), (await get(emoji.url)).raw);

                  _this.replySuccess(`Downloaded ${_this.getFullEmoji(emoji)}`);
                } catch (error) {
                  console.error(error);

                  _this.replyError(`Failed to download ${_this.getFullEmoji(emoji)}, check the console for more information`, {
                    description: `Failed to download ${_this.getFullEmoji(emoji)}`,
                    footer: {
                      text: 'Check the console for more information'
                    }
                  });
                }
              }
            });

            if (!emoji.fake) {
              features.push({
                type: 'button',
                name: 'Go to server',
                onClick: () => {
                  transitionTo(_this.getGuildRoute(emoji.guildId));
                }
              });
            }

            features.push({
              type: 'button',
              name: 'Copy ID',
              onClick: () => clipboard.writeText(emoji.id)
            });

            return features;
          };

          res.props.children.push(
            React.createElement(Submenu, {
              name: 'Emote',
              seperate: true,
              getItems: getFeatures
            })
          );
        }
      }
      return res;
    });

    const EmojiNameModal = require('./EmojiNameModal.jsx');
    inject('pc-emojiUtility-imageContext', MessageContextMenu.prototype, 'render', function (args, res) { // eslint-disable-line func-names
      const { target } = this.props;
      if (target.parentElement.classList.contains('pc-embedWrapper')) {
        const getCreateableGuilds = () => {
          const items = [];
          const createableGuilds = Object.values(getGuilds()).filter(guild => _this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS));

          const onClick = (guild) => {
            openModal(() => React.createElement(EmojiNameModal, {
              onConfirm: async (name) => {
                if (!name || (name.length < 2 || name.length > 32)) {
                  _this.replyError('Please enter an emote name with more than 2 and less than 32 characters');

                  return;
                }

                try {
                  await uploadEmoji(guild.id, await _this.getImageEncoded(target.src), name);

                  _this.replySuccess(`Created emote by the name of **${name}** in **${guild.name}**`);
                } catch (error) {
                  if (error.body && error.body.image) {
                    _this.replyError(error.body.image[0]);
                  } else {
                    console.error(error);

                    _this.replyError('Failed to create emote, check the console for more information', {
                      description: 'Failed to create emote',
                      footer: {
                        text: 'Check the console for more information'
                      }
                    });
                  }
                }
              }
            }));
          };

          for (const guild of createableGuilds) {
            items.push({
              type: 'button',
              name: guild.name,
              onClick: () => onClick(guild)
            });
          }

          return items;
        };

        const getFeatures = () => {
          const features = [];

          features.push({
            type: 'submenu',
            hint: 'in',
            name: 'Create',
            getItems: getCreateableGuilds
          });

          return features;
        };

        res.props.children.push(
          React.createElement(Submenu, {
            name: 'Emote',
            seperate: true,
            getItems: getFeatures
          })
        );
      }

      return res;
    });

    powercord
      .pluginManager
      .get('pc-settings')
      .register(
        'pc-emojiUtility',
        'Emote Utility',
        () =>
          React.createElement(Settings, {
            settings: this.settings
          })
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'findemote',
        'Find the server an emote is from',
        '{c} [emote]',
        (args) => {
          const object = this.findEmojisForCommand(args);
          if ('send' in object && 'result' in object) {
            return object;
          }

          const { foundEmojis, notFoundEmojis } = object;

          if (this.settings.get('useEmbeds')) {
            return {
              send: false,
              result: {
                type: 'rich',
                description: foundEmojis.map(emoji => `${this.getFullEmoji(emoji)} is from **[${emoji.guild.name}](${this.getGuildUrl(emoji.guildId)})**`).join('\n'),
                color: 65280,
                footer: notFoundEmojis.length > 0
                  ? {
                    text: `${notFoundEmojis.length} of the provided arguments ${notFoundEmojis.length === 1 ? 'is not a custom emote' : 'are not custom emotes'}`
                  }
                  : null
              }
            };
          }

          let description = foundEmojis.map(emoji => `${this.getFullEmoji(emoji)} is from **${emoji.guild.name}**${this.settings.get('displayLink') ? ` (**${this.getGuildUrl(emoji.guildId)}**)` : ''}`).join('\n');
          if (notFoundEmojis.length > 0) {
            description += `${description.length > 0 ? '\n\n' : ''}**${notFoundEmojis.length}** of the provided arguments ${notFoundEmojis.length === 1 ? 'is not a custom emote' : 'are not custom emotes'}`;
          }

          return {
            send: false,
            result: description
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
              result: this.settings.get('useEmbeds')
                ? {
                  type: 'rich',
                  description: 'Please provide an emote name',
                  color: 16711680
                }
                : 'Please provide an emote name'
            };
          }

          const emojis = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis);

          const foundEmojis = emojis.filter(emoji => emoji.name.toLowerCase().includes(argument));
          if (foundEmojis.length > 0) {
            const emojisAsString = foundEmojis.map(emoji => this.getFullEmoji(emoji)).join('');
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

          return this.replyError(`Could not find any emotes containing **${argument}**`);
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'saveemote',
        'Save emotes to a specified directory',
        '{c} [emote]',
        async (args) => { // eslint-disable-line complexity
          if (!this.settings.get('filePath')) {
            return this.replyError('Please set your save directory in the settings');
          }

          if (!existsSync(this.settings.get('filePath'))) {
            return this.replyError('The specified save directory does no longer exist, please update it in the settings');
          }

          const object = this.findEmojisForCommand(args);
          if ('send' in object && 'result' in object) {
            return object;
          }

          const { foundEmojis, notFoundEmojis } = object;

          if (notFoundEmojis.length > 0) {
            return this.replyError(`**${notFoundEmojis.length}** of the provided arguments ${notFoundEmojis.length === 1 ? 'is not a custom emote' : 'are not custom emotes'}`);
          }

          if (foundEmojis.length < 5) {
            for (const emoji of foundEmojis) {
              try {
                const name = this.settings.get('includeIdForSavedEmojis') ? `${emoji.name} (${emoji.id})` : emoji.name;

                await writeFile(resolve(this.settings.get('filePath'), name + extname(parse(emoji.url).pathname)), (await get(emoji.url)).raw);

                this.replySuccess(`Downloaded ${this.getFullEmoji(emoji)}`);
              } catch (error) {
                console.error(error);

                this.replyError(`Failed to download ${this.getFullEmoji(emoji)}, check the console for more information`, {
                  description: `Failed to download ${this.getFullEmoji(emoji)}`,
                  footer: {
                    text: 'Check the console for more information'
                  }
                });
              }
            }
          } else {
            this.replySuccess(`Downloading **${foundEmojis.length}** emotes, I will report back to you when I am done`);

            const failedDownloads = [];

            for (const emoji of foundEmojis) {
              try {
                const name = this.settings.get('includeIdForSavedEmojis') ? `${emoji.name} (${emoji.id})` : emoji.name;

                await writeFile(resolve(this.settings.get('filePath'), name + extname(parse(emoji.url).pathname)), (await get(emoji.url)).raw);
              } catch (error) {
                console.error(error);

                failedDownloads.push(emoji);
              }
            }

            this.replySuccess(`Successfully downloaded **${foundEmojis.length - failedDownloads.length}**/**${foundEmojis.length}** emotes`);
          }
        }
      );

    powercord
      .pluginManager
      .get('pc-commands')
      .register(
        'cloneemote',
        'Clone an emote to your own server',
        '{c} [emote] [server]',
        async (args) => { // eslint-disable-line complexity
          if (args.length === 0) {
            return this.replyError('Please provide an emote');
          }

          const emojiRaw = args[0];
          const matcher = emojiRaw.match(this.getEmojiRegex());
          if (!matcher) {
            return this.replyError(`**${emojiRaw}** is not a custom emote`);
          }

          let guild;

          const guildArg = args.slice(1).join(' ');
          if (guildArg.length > 0) {
            guild = this.getGuildByIdOrName(guildArg);
            if (!guild) {
              return this.replyError('That is not a valid server');
            }
          } else {
            if (this.settings.get('defaultCloneIdUseCurrent')) {
              guild = getGuild(getChannel(getChannelId()).guild_id);
            } else if (this.settings.get('defaultCloneId')) {
              guild = getGuild(this.settings.get('defaultCloneId'));
              if (!guild) {
                return this.replyError('You are no longer in your default clone server, please update your settings');
              }
            }

            if (!guild) {
              return this.replyError('No server argument was provided');
            }
          }

          const emoji = Object.values(emojiStore.getGuilds()).flatMap(r => r.emojis).find(e => e.id === matcher[2]);
          if (emoji) {
            try {
              if (!this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS)) {
                return this.replyError(`Missing permissions to upload emotes in **${guild.name}**`);
              }

              await uploadEmoji(guild.id, await this.getImageEncoded(emoji.url), emoji.name);

              return this.replySuccess(`Cloned emote ${this.getFullEmoji(emoji)} to **${guild.name}**`);
            } catch (error) {
              console.error(error);

              return this.replyError('Failed to clone emote, check the console for more information', {
                description: 'Failed to clone emote',
                footer: {
                  text: 'Check the console for more information'
                }
              });
            }
          } else {
            return this.replyError(`Could not find emote ${emojiRaw}`);
          }
        }
      );
  }
};
