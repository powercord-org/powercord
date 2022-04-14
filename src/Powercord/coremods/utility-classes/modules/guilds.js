const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const Guild = await getModule(m => typeof m.default === 'function' && m.default.toString().includes('GUILD_TOOLTIP_A11Y_LABEL'));

  inject('pc-utilitycls-guilds', Guild, 'default', (args, res) => {
    const { guild, badge: mentions, selected, unread, mediaState } = args[0];

    const conditionals = {
      unread,
      selected,
      audio: mediaState.audio,
      video: mediaState.video,
      mentioned: mentions > 0
    };

    Object.keys(conditionals).forEach(key => {
      if (conditionals[key]) {
        res.props.className += ` ${key}`;
      }
    });

    res.props['data-guild-name'] = guild.name;
    res.props['data-guild-id'] = guild.id;

    return res;
  });

  return () => uninject('pc-utilitycls-guilds');
};
