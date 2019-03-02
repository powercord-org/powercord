const Plugin = require('powercord/Plugin');

const {
  getModuleByDisplayName,
  getModule,
  React,
  contextMenu,
  channels: {
    getSelectedChannelState,
    getChannelId
  },
  constants: {
    Routes,
    GuildFeatures,
    Permissions,
    APP_URL_PREFIX,
    EMOJI_RE,
    EMOJI_MAX_LENGTH,
    EMOJI_MAX_SLOTS,
    EMOJI_MAX_SLOTS_MORE
  },
  messages: {
    createBotMessage,
    receiveMessage
  }
} = require('powercord/webpack');

const { CDN_HOST } = window.GLOBAL_ENV;

const { ContextMenu, ContextMenu: { Submenu } } = require('powercord/components');

const { inject, injectInFluxContainer, uninject } = require('powercord/injector');
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
const { getCurrentUser } = getModule([ 'getCurrentUser' ]);

const { clipboard } = require('electron');

const Settings = require('./components/Settings.jsx');

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

  getExtension (url) {
    return extname(parse(url).pathname).substring(1);
  }

  async getImageEncoded (imageUrl) {
    const extension = this.getExtension(imageUrl);
    const { raw } = await get(imageUrl);

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
          emoji.guild = getGuild(emoji.guildId);

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

  getEmojis (guildId, animated = null) {
    return emojiStore.getGuilds()[guildId].emojis.filter(e => animated === null || e.animated === animated);
  }

  getEmojiById (id) {
    return Object.values(emojiStore.getGuilds()).flatMap(g => g.emojis).find(e => e.id === id);
  }

  getMaxEmojiSlots (guildId) {
    return getGuild(guildId).hasFeature(GuildFeatures.MORE_EMOJI) ? EMOJI_MAX_SLOTS_MORE : EMOJI_MAX_SLOTS;
  }

  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));

    /* Default settings */
    this.settings.set('useEmbeds', this.settings.get('useEmbeds', false));
    this.settings.set('displayLink', this.settings.get('displayLink', true));
    this.settings.set('filePath', this.settings.get('filePath', null));
    this.settings.set('includeIdForSavedEmojis', this.settings.get('includeIdForSavedEmojis', true));
    this.settings.set('defaultCloneId', this.settings.get('defaultCloneId', null));
    this.settings.set('defaultCloneIdUseCurrent', this.settings.get('defaultCloneIdUseCurrent', false));

    const _this = this;

    const getCloneableFeatures = (emoji) => {
      const onGuildClick = async (guild) => {
        if (!guild) {
          if (this.settings.get('defaultCloneIdUseCurrent')) {
            guild = getGuild(getChannel(getChannelId()).guild_id);
          } else if (this.settings.get('defaultCloneId')) {
            guild = getGuild(this.settings.get('defaultCloneId'));
            if (!guild) {
              return this.replyError('You are no longer in your default server, please update your settings');
            }
          }

          if (guild) {
            if (!this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS)) {
              return this.replyError(`Missing permissions to upload emotes in **${guild.name}**`);
            }
          } else {
            return this.replyError('You do not have a default server, please update your settings');
          }
        }

        if (this.getEmojis(guild.id, emoji.animated).length >= this.getMaxEmojiSlots(guild.id)) {
          return this.replyError(`**${guild.name}** does not have any more emote slots`);
        }

        try {
          await uploadEmoji(guild.id, await this.getImageEncoded(emoji.url), emoji.name);

          this.replySuccess(`Cloned emote ${this.getFullEmoji(emoji)} to **${guild.name}**`);
        } catch (error) {
          console.error(error);

          if (error.body && error.body.message) {
            this.replyError(error.body.message);
          } else {
            this.replyError('Failed to clone emote, check the console for more information', {
              description: 'Failed to clone emote',
              footer: {
                text: 'Check the console for more information'
              }
            });
          }
        }
      };

      const getCloneableGuilds = () => {
        const items = [];
        const clonableGuilds = Object.values(getGuilds()).filter(guild => this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS));

        for (const guild of clonableGuilds) {
          items.push({
            type: 'button',
            name: guild.name,
            onClick: () => onGuildClick(guild)
          });
        }

        return items;
      };

      const features = [];

      features.push({
        type: 'submenu',
        name: 'Clone',
        hint: 'to',
        onClick: () => onGuildClick(null),
        getItems: getCloneableGuilds
      });

      features.push({
        type: 'button',
        name: 'Save',
        onClick: async () => {
          if (!this.settings.get('filePath')) {
            this.replyError('Please set your save directory in the settings');

            return;
          }

          if (!existsSync(this.settings.get('filePath'))) {
            this.replyError('The specified save directory does no longer exist, please update it in the settings');

            return;
          }

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
      });

      if (!emoji.fake) {
        features.push({
          type: 'button',
          name: 'Go to server',
          onClick: () => {
            transitionTo(this.getGuildRoute(emoji.guildId));
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

    const EmojiNameModal = require('./components/EmojiNameModal.jsx');
    const getCreateableFeatures = (target) => {
      const onGuildClick = (guild) => {
        if (!guild) {
          if (this.settings.get('defaultCloneIdUseCurrent')) {
            guild = getGuild(getChannel(getChannelId()).guild_id);
          } else if (this.settings.get('defaultCloneId')) {
            guild = getGuild(this.settings.get('defaultCloneId'));
            if (!guild) {
              return this.replyError('You are no longer in your default server, please update your settings');
            }
          }

          if (guild) {
            if (!this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS)) {
              return this.replyError(`Missing permissions to upload emotes in **${guild.name}**`);
            }
          } else {
            return this.replyError('You do not have a default server, please update your settings');
          }
        }

        if (this.getEmojis(guild.id, this.getExtension(target.src) === 'gif').length >= this.getMaxEmojiSlots(guild.id)) {
          return this.replyError(`**${guild.name}** does not have any more emote slots`);
        }

        openModal(() => React.createElement(EmojiNameModal, {
          onConfirm: async (name) => {
            name = name.replace(EMOJI_RE, '').substr(0, EMOJI_MAX_LENGTH);

            if (name.length < 2) {
              this.replyError('Please enter an emote name with 2 or more valid characters, valid characters are **a-z**, **0-9** and **_**');

              return;
            }

            try {
              await uploadEmoji(guild.id, await this.getImageEncoded(target.src), name);

              this.replySuccess(`Created emote by the name of **${name}** in **${guild.name}**`);
            } catch (error) {
              console.error(error);

              if (error.body && error.body.image) {
                this.replyError(error.body.image[0]);
              } else if (error.body && error.body.message) {
                this.replyError(error.body.message);
              } else {
                this.replyError('Failed to create emote, check the console for more information', {
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

      const getCreateableGuilds = () => {
        const items = [];
        const createableGuilds = Object.values(getGuilds()).filter(guild => this.hasPermission(guild.id, Permissions.MANAGE_EMOJIS));

        for (const guild of createableGuilds) {
          items.push({
            type: 'button',
            name: guild.name,
            onClick: () => onGuildClick(guild)
          });
        }

        return items;
      };

      const features = [];

      features.push({
        type: 'submenu',
        hint: 'in',
        name: 'Create',
        onClick: () => onGuildClick(null),
        getItems: getCreateableGuilds
      });

      return features;
    };

    const MessageContextMenu = await getModuleByDisplayName('MessageContextMenu');
    inject('pc-emojiUtility-emojiContext', MessageContextMenu.prototype, 'render', function (args, res) {
      const { target } = this.props;
      if (target.classList.contains('emoji')) {
        const matcher = target.src.match(_this.getEmojiUrlRegex());
        if (matcher) {
          let emoji = _this.getEmojiById(matcher[1]);
          if (emoji) {
            emoji.fake = false;
          } else {
            emoji = _this.createFakeEmoji(matcher[1], target.alt.substring(1, target.alt.length - 1), target.src);
          }

          res.props.children.push(
            React.createElement(Submenu, {
              name: 'Emote',
              seperate: true,
              getItems: () => getCloneableFeatures(emoji)
            })
          );
        }
      }
      return res;
    });

    const handleImageContext = function (args, res) {
      const { target } = this.props;

      if (target.tagName.toLowerCase() === 'img' && target.parentElement.classList.contains('pc-imageWrapper')) {
        /* NativeContextMenu's children is a single object, turn it in to an array to be able to push */
        if (typeof res.props.children === 'object') {
          const children = [];
          children.push(res.props.children);

          res.props.children = children;
        }

        res.props.children.push(
          React.createElement(Submenu, {
            name: 'Emote',
            seperate: true,
            getItems: () => getCreateableFeatures(target)
          })
        );
      }

      return res;
    };

    inject('pc-emojiUtility-imageContext', MessageContextMenu.prototype, 'render', handleImageContext);

    const NativeContextMenu = getModuleByDisplayName('NativeContextMenu');
    inject('pc-emojiUtility-nativeContext', NativeContextMenu.prototype, 'render', handleImageContext);

    /* AnimatedComponent is used for reactions */
    const AnimatedComponent = getModule([ 'createAnimatedComponent' ]).div;
    inject('pc-emojiUtility-reactionContext', AnimatedComponent.prototype, 'render', function (args, res) {
      if (this.props.className && this.props.className.includes('pc-reaction')) {
        res.props.onContextMenu = (e) => {
          const { props: propEmoji } = this.props.children.props.children[0];

          if (propEmoji.emojiId) {
            let emoji = _this.getEmojiById(propEmoji.emojiId);
            if (emoji) {
              emoji.fake = false;
            } else {
              emoji = _this.createFakeEmoji(propEmoji.emojiId, propEmoji.emojiName, `https://${CDN_HOST}/emojis/${propEmoji.emojiId}.${propEmoji.animated ? 'gif' : 'png'}`);
            }

            const { pageX, pageY } = e;
            contextMenu.openContextMenu(e, () =>
              React.createElement(ContextMenu, {
                pageX,
                pageY,
                itemGroups: [ [ {
                  type: 'submenu',
                  name: 'Emote',
                  getItems: () => getCloneableFeatures(emoji)
                } ] ]
              })
            );
          }
        };
      }

      return res;
    });

    injectInFluxContainer('pc-emojiUtility-hideEmojisPickerRm', 'EmojiPicker', 'removeEmotes', function () {
      const hiddenGuilds = _this.settings.get('hiddenGuilds', []);
      const hiddenNames = hiddenGuilds.map(id => getGuild(id).name);

      this.setState({
        metaData: this.state.metaData.map(meta => ({
          ...meta,
          items: meta.items.filter(item => !item.emoji.guildId || !hiddenGuilds.includes(item.emoji.guildId))
        })).filter(meta => meta.items.length > 0)
      });

      let previousOffset = 0;
      let offsetDiff = 0;
      this.categories = this.categories.map(category => {
        if (category.category.startsWith('custom') && hiddenNames.includes(category.title)) {
          offsetDiff += category.offsetTop - previousOffset;
          previousOffset = category.offsetTop;
          delete this.categoryOffsets[category.category];
          return null;
        }
        category.offsetTop -= offsetDiff;
        this.categoryOffsets[category.category] = category.offsetTop;
        previousOffset = category.offsetTop;
        return category;
      }).filter(category => !!category);
    });

    injectInFluxContainer('pc-emojiUtility-hideEmojisPickerMount', 'EmojiPicker', 'componentDidMount', function () {
      this.removeEmotes();
    });

    injectInFluxContainer('pc-emojiUtility-hideEmojisPicker', 'EmojiPicker', 'componentDidUpdate', function () {
      if (this.state.searchResults) {
        this.shouldFilter = true;
      } else {
        if (this.shouldFilter) {
          this.shouldFilter = false;
          this.removeEmotes();
        }
      }
    });

    const Autocomplete = await getModuleByDisplayName('Autocomplete');
    inject('pc-emojiUtility-hideEmojisComplete', Autocomplete.prototype, 'render', (args, res) => {
      if (res) {
        const hiddenGuilds = _this.settings.get('hiddenGuilds', []);

        if (res.props.children.props.children[0].key.includes('Emoji')) {
          res.props.children.props.children[1] = res.props.children.props.children[1].filter(emoji =>
            !emoji.props.emoji.guildId || !hiddenGuilds.includes(emoji.props.emoji.guildId)
          );
        }

        if (res.props.children.props.children[1].length === 0) {
          return null;
        }
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
          if (!object) {
            return;
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
            return this.replyError('Please provide an emote name');
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

            if (!getCurrentUser().premiumType > 0) {
              return {
                send: false,
                result: `Looks like you do not have nitro, let me send that locally instead!\n${emojisAsString}`
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
        async (args) => {
          if (!this.settings.get('filePath')) {
            return this.replyError('Please set your save directory in the settings');
          }

          if (!existsSync(this.settings.get('filePath'))) {
            return this.replyError('The specified save directory does no longer exist, please update it in the settings');
          }

          const object = this.findEmojisForCommand(args);
          if (!object) {
            return;
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
        async (args) => {
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

              if (this.getEmojis(guild.id, emoji.animated).length >= this.getMaxEmojiSlots(guild.id)) {
                return this.replyError(`**${guild.name}** does not have any more emote slots`);
              }

              await uploadEmoji(guild.id, await this.getImageEncoded(emoji.url), emoji.name);

              return this.replySuccess(`Cloned emote ${this.getFullEmoji(emoji)} to **${guild.name}**`);
            } catch (error) {
              console.error(error);

              if (error.body.message) {
                return this.replyError(error.body.message);
              }
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

  unload () {
    this.unloadCSS();

    uninject('pc-emojiUtility-emojiContext');
    uninject('pc-emojiUtility-imageContext');
    uninject('pc-emojiUtility-nativeContext');
    uninject('pc-emojiUtility-reactionContext');
    uninject('pc-emojiUtility-hideEmojisPicker');
    uninject('pc-emojiUtility-hideEmojisPickerRm');
    uninject('pc-emojiUtility-hideEmojisPickerMount');
    uninject('pc-emojiUtility-hideEmojisComplete');
    uninject('pc-emojiUtility-hideEmojisCompleteEvent');

    const { pluginManager } = powercord;

    const pcCommands = pluginManager.get('pc-commands');
    pcCommands.unregister('findemote');
    pcCommands.unregister('massemote');
    pcCommands.unregister('saveemote');
    pcCommands.unregister('cloneemote');

    const pcSettings = pluginManager.get('pc-settings');
    pcSettings.unregister('pc-emojiUtility');
  }
};
