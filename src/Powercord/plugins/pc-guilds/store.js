const { getModule } = require('powercord/webpack');

module.exports = class GuildStore {
  constructor (settingsManager) {
    this.settings = settingsManager;
  }

  async init () {
    this.guildStore = await getModule([ 'getGuilds' ]);
    this.updater = await getModule([ 'updateRemoteSettings' ]);
    this.sortedGuildStore = await getModule([ 'getSortedGuilds' ]);
    this.snowflake = await getModule([ 'extractTimestamp' ]);
  }

  createFolder (name, icon) {
    const id = this.snowflake.fromTimestamp(Date.now());
    const guilds = this.getGuilds();
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
    /*
     * const guildIds = this.settings.get('guilds', null);
     * if (!guildIds) {
     */
    return this.sortedGuildStore.getSortedGuilds().map(g => g.guild.id);
    /*
     * }
     * return this._ensureUpdated(guildIds);
     */
  }

  getGuild (id) {
    return this.guildStore.getGuild(id);
  }

  handleDnD (result) {
    if (!result.destination) {
      return;
    }

    const guilds = Array.from(this.getGuilds());
    const [ removed ] = guilds.splice(result.source.index, 1);
    guilds.splice(result.destination.index, 0, removed);

    this._pushToAPI(guilds);
  }

  _ensureUpdated (guildIds) {
    const discordGuilds = Object.values(this.guildStore.getGuilds());
    // Step 1: Cleaning up removed guilds
    const guilds = guildIds.filter(g => (g.guilds) ? true : this.guildStore.getGuild(g));

    // Step 2: Adding missing guilds
    discordGuilds.forEach(g => {
      if (!guilds.includes(g.id)) {
        guilds.unshift(g.id);
      }
    });

    return guilds;
  }

  _pushToAPI (guildIds) {
    guildIds = this._flatGuilds(guildIds);
    this.updater.updateRemoteSettings({
      guildPositions: guildIds
    });
  }

  _flatGuilds (guildIds) {
    const guilds = [];
    guildIds.forEach(guildId => {
      if (typeof guildId === 'string') {
        guilds.push(guildId);
      } else {
        guilds.push(...this._flatGuilds(guildId.guilds));
      }
    });
    return guilds;
  }
};
