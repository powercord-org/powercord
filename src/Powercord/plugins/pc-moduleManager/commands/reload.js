module.exports = {
  command: 'reload',
  description: 'Allows you to reload a selected plugin from the given list.',
  usage: '{c} [ plugin ID ]',
  async executor (args) {
    let result;

    if (powercord.pluginManager.plugins.has(args[0])) {
      if (args[0] === 'pc-commands') {
        result = `->> ERROR: You cannot reload this plugin as it depends on delivering these commands!
            (Tried to reload ${args[0]})`;
      } else if (!powercord.pluginManager.isEnabled(args[0])) {
        result = `->> ERROR: Tried to reload a non-loaded plugin!
            (${args[0]})`;
      } else {
        await powercord.pluginManager.remount(args[0]);
        result = `+>> SUCCESS: Plugin reloaded!
            (${args[0]})`;
      }
    } else {
      result = `->> ERROR: Tried to reload a non-installed plugin!
          (${args[0]})`;
    }

    return {
      send: false,
      result: `\`\`\`diff\n${result}\`\`\``
    };
  },

  autocomplete (args) {
    const plugins = powercord.pluginManager.getPlugins()
      .sort((a, b) => a - b)
      .map(plugin => powercord.pluginManager.plugins.get(plugin));

    if (args.length > 1) {
      return false;
    }

    return {
      commands: plugins
        .filter(plugin => plugin.entityID !== 'pc-commands' &&
          plugin.entityID.toLowerCase().includes((args[0] || '').toLowerCase()))
        .map(plugin => ({
          command: plugin.entityID,
          description: plugin.manifest.description
        })),
      header: 'powercord plugin list'
    };
  }
};
