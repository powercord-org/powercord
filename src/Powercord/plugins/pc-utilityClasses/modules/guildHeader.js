const { forceUpdateElement } = require('powercord/util');
const { getModule, getModuleByDisplayName } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');

module.exports = async () => {
  const GuildHeader = await getModuleByDisplayName('GuildHeader');
  inject('pc-utilitycls-guildHeader', GuildHeader.prototype, 'renderHeader', function (args, res) {
    res.props['data-guild-id'] = this.props.guild.id;
    return res;
  });

  const className = (await getModule([ 'iconBackgroundTierNone', 'container' ])).header.split(' ')[0];
  setImmediate(() => forceUpdateElement(`.${className}`));
  return async () => uninject('pc-utilitycls-guildHeader');
};
