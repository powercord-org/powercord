const { CORE_PLUGINS } = require('powercord/constants');

module.exports = {
  command: 'disable',
  description: 'Allows you to disable a selected plugin/theme from the given list.',
  usage: '{c} [ plugin/theme ID ]',
  executor (args) {
    let result;

    const isPlugin = powercord.pluginManager.plugins.has(args[0]);
    const isTheme = powercord.styleManager.themes.has(args[0]);

    if (!isPlugin && !isTheme) { // No match
      result = `->> ERROR: Could not find plugin or theme matching that name.
      (${args[0]})`;
    } else if (isPlugin && isTheme) { // Duplicate name
      result = `->> ERROR: This name is in use by both a plugin and theme. You will have to disable it from settings.
      (${args[0]})`;
    } else if (isPlugin && CORE_PLUGINS.includes(args[0])) { // Core internal plugin
      result = `->> ERROR: This plugin provides core functionality and cannot be disabled.
      (${args[0]})`;
    } else {
      const manager = isPlugin ? powercord.pluginManager : powercord.styleManager;
      if (!manager.isEnabled(args[0])) {
        result = `->> ERROR: Tried to disable an already disabled ${isPlugin ? 'plugin' : 'theme'}!
        (${args[0]})`;
      } else {
        manager.disable(args[0]);
        result = `+>> SUCCESS: ${isPlugin ? 'Plugin' : 'Theme'} disabled!
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
      .filter(plugin => !CORE_PLUGINS.includes(plugin))
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
