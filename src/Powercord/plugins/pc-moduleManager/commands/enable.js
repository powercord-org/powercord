module.exports = {
  command: 'enable',
  description: 'Allows you to re-/enable a selected plugin/theme from the given list.',
  usage: '{c} [ plugin/theme ID ]',
  executor (args) {
    let result;

    const isPlugin = powercord.pluginManager.plugins.has(args[0]);
    const isTheme = powercord.styleManager.themes.has(args[0]);

    if (!isPlugin && !isTheme) { // No match
      result = `->> ERROR: Could not find plugin or theme matching that name.
      (${args[0]})`;
    } else if (isPlugin && isTheme) { // Duplicate name
      result = `->> ERROR: This name is in use by both a plugin and theme. You will have to enable it from settings.
      (${args[0]})`;
    } else {
      const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;
      if (manager.isEnabled(args[0])) {
        result = `->> ERROR: Tried to enable an already enabled ${isPlugin ? 'plugin' : 'theme'}!
        (${args[0]})`;
      } else {
        manager.enable(args[0]);
        result = `+>> SUCCESS: ${isPlugin ? 'Plugin' : 'Theme'} enabled!
        (${args[0]})`;
      }
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
        .filter(plugin => plugin.entityID.toLowerCase().includes(args[0] && args[0].toLowerCase()) && !powercord.pluginManager.isEnabled(plugin.entityID))
        .map(plugin => ({
          command: plugin.entityID,
          description: `Plugin - ${plugin.manifest.description}`
        })), ...themes
        .filter(theme => theme.entityID.toLowerCase().includes(args[0] && args[0].toLowerCase()) && !powercord.styleManager.isEnabled(theme.entityID))
        .map(theme => ({
          command: theme.entityID,
          description: `Theme - ${theme.manifest.description}`
        })) ],
      header: 'powercord plugin list'
    };
  }
};
