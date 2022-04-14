const { forceUpdateElement } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const GuildHeader = await getModule([ 'AnimatedBanner', 'default' ]);
  inject('pc-utilitycls-guildHeader', GuildHeader.default, 'type', ([ props ], res) => {
    res.props.children[0].props['data-guild-id'] = props.guild.id;
    return res;
  });

  const className = (await getModule([ 'container', 'hasBanner' ])).header.split(' ')[0];
  setImmediate(() => forceUpdateElement(`.${className}`));
  return () => uninject('pc-utilitycls-guildHeader');
};
