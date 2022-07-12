module.exports = {
  command: 'disable',
  description: 'Allows you to disable a selected plugin/theme from the given list.',
  usage: '{c} [ plugin/theme ID ]',
  executor (args) {
    let result;

    if (powercord.pluginManager.plugins.has(args[0]) && powercord.styleManager.themes.has(args[0])) {
      result = `->> ERROR: This name has been reserved by both a plugin and theme. You will have to manually disable whichever one you choose.
          (${args[0]})`;
    } else if (powercord.pluginManager.plugins.has(args[0])) {
      if (!powercord.pluginManager.isEnabled(args[0])) {
        result = `->> ERROR: Tried to unload an already unloaded plugin!
            (${args[0]})`;
      } else {
        powercord.pluginManager.disable(args[0]);
        result = `+>> SUCCESS: Plugin unloaded!
            (${args[0]})`;
      }
    } else if (powercord.styleManager.themes.has(args[0])) {
      if (!powercord.styleManager.isEnabled(args[0])) {
        result = `->> ERROR: Tried to unload an already unloaded theme!
            (${args[0]})`;
      } else {
        powercord.styleManager.disable(args[0]);
        result = `+>> SUCCESS: Theme unloaded!
            (${args[0]})`;
      }
    } else {
      result = `->> ERROR: Tried to disable a non-installed theme or plugin!
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

    const themes = powercord.styleManager.getThemes()
      .sort((a, b) => a - b)
      .map(theme => powercord.styleManager.themes.get(theme));

    if (args.length > 1) {
      return false;
    }

    return {
      commands: [ ...plugins
        .filter(plugin => plugin.entityID !== 'pc-commands' &&
          plugin.entityID.toLowerCase().includes(args[0] && args[0].toLowerCase()) && powercord.pluginManager.isEnabled(plugin.entityID))
        .map(plugin => ({
          command: plugin.entityID,
          description: plugin.manifest.description
        })), ...themes
        .filter(theme => theme.entityID.toLowerCase().includes(args[0] && args[0].toLowerCase()) && powercord.styleManager.isEnabled(theme.entityID))
        .map(theme => ({
          command: theme.entityID,
          description: `Theme - ${theme.manifest.description}`
        })) ],
      header: 'powercord plugin list'
    };
  }
};
