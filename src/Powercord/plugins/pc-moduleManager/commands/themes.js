module.exports = {
  command: 'themes',
  aliases: [ 'tlist' ],
  description: 'Prints out a list of currently installed themes.',
  usage: '{c}',
  executor () {
    const themes = powercord.styleManager.getThemes();
    const result = {
      type: 'rich',
      title: `List of Installed Themes (${themes.length})`,
      description: `\`${themes.join('\n')}\``
    };

    return {
      send: false,
      result
    };
  }
};
