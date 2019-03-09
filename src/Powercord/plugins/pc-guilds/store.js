const { getModule } = require('powercord/webpack');

module.exports = class GuildStore {
  constructor (settingsManager) {
    this.settings = settingsManager;
    this.guildStore = getModule([ 'getGuilds' ]);
    this.updater = getModule([ 'updateRemoteSettings' ]);
    this.sortedGuildStore = getModule([ 'getSortedGuilds' ]);
  }

  getGuilds () {
    const guildIds = this.settings.get('guilds', null);
    if (!guildIds) {
      return this.sortedGuildStore.getSortedGuilds().map(g => g.guild);
    }
    return this._getGuildsFromId(guildIds);
  }

  handleDnD (result) {
    if (!result.destination) {
      return;
    }

    const guilds = Array.from(this.getGuilds().map(g => g.id));
    const [ removed ] = guilds.splice(result.source.index, 1);
    guilds.splice(result.destination.index, 0, removed);
    this.settings.set('guilds', guilds);

    this._pushToAPI();
  }

  _getGuildsFromId (guildIds) {
    const guilds = [];
    guildIds.forEach(guildId => {
      if (typeof guildId === 'string') {
        guilds.push(this.guildStore.getGuild(guildId));
      } else {
        guilds.push({
          name: guildId.name,
          icon: guildId.icon,
          guilds: this._getGuildsFromId(guildId.guilds)
        });
      }
    });
    return guilds;
  }

  _pushToAPI () {
    const guildIds = this._flatGuildsIds(this.settings.get('guilds', null));
    this.updater.updateRemoteSettings({
      guildPositions: guildIds
    });
  }

  _flatGuildsIds (guildIds) {
    const guilds = [];
    guildIds.forEach(guildId => {
      if (typeof guildId === 'string') {
        guilds.push(guildId);
      } else {
        guilds.push(...this._flatGuildsIds(guildId.guilds));
      }
    });
    return guilds;
  }
};
