const { getModule } = require('powercord/webpack');

module.exports = class GuildStore {
  constructor (settingsManager) {
    this.settings = settingsManager;
    this.guildStore = getModule([ 'getGuilds' ]);
    this.updater = getModule([ 'updateRemoteSettings' ]);
    this.sortedGuildStore = getModule([ 'getSortedGuilds' ]);
    this.snowflake = getModule([ 'extractTimestamp' ]);
  }

  createFolder (name, icon) {
    const id = this.snowflake.fromTimestamp(Date.now());
    const guilds = this.getGuildIds();
    guilds.unshift({
      id,
      name,
      icon,
      guilds: []
    });
    this.settings.set('guilds', guilds);
  }

  deleteFolder (id) {
    const guilds = this.getGuildIds();
    this.settings.set('guilds', guilds.filter(g => !(typeof g === 'object' && g.id === id)));
  }

  getGuilds () {
    const guildIds = this.settings.get('guilds', null);
    if (!guildIds) {
      return this.sortedGuildStore.getSortedGuilds().map(g => g.guild);
    }
    return this._getGuildsFromId(guildIds);
  }

  getGuildIds () {
    const guildIds = this.settings.get('guilds', null);
    if (!guildIds) {
      return this.sortedGuildStore.getSortedGuilds().map(g => g.guild.id);
    }
    return guildIds;
  }

  handleDnD (result) {
    if (!result.destination) {
      return;
    }

    const guilds = Array.from(this.getGuildIds());
    const [ removed ] = guilds.splice(result.source.index, 1);
    guilds.splice(result.destination.index, 0, removed);
    this.settings.set('guilds', guilds);

    this._pushToAPI();
  }

  _getGuildsFromId (guildIds) {
    const guilds = [];
    guildIds.forEach(guildId => {
      if (typeof guildId === 'string') {
        const guild = this.guildStore.getGuild(guildId);
        if (guild) {
          guilds.push(guild);
        }
      } else {
        guilds.push({
          id: guildId.id,
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
