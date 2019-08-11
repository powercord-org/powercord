module.exports = {
    command: 'pluginlist',
    description: 'List all the plugins that are installed',
    usage: '{c}',
    aliases: ['plugins'],
    func: (args) => {
        let result;
        let plugins = powercord.pluginManager.getPlugins()
        result = {
            type: 'rich',
            title: `List of Plugins (${plugins.length})`,
            description: `\`${plugins.join('\`\n\`')}\``,
          };
        return { 
            send: false,
            result
        }
    }
}
