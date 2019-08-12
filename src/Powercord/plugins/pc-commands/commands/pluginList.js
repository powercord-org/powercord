
module.exports = {
  command: 'plugins',
  aliases: [ 'plist' ],
  description: 'Prints out a list of currently installed plugins.',
  usage: '{c}',

  func () {
    const plugins = powercord.pluginManager.getPlugins();
    const result = {
      type: 'rich',
      title: `List of Installed Plugins (${plugins.length})`,
      description: `\`${plugins.join('\n')}\``
    };

    return {
      send: false,
      result
    };
  }
};
