module.exports = {
    command: 'enable',
    description: 'Enable a plugin',
    usage: '{c} [ Plugin Name ]',
    aliases: [],
    func: (args) => {
        let result;
        if(powercord.pluginManager.plugins.has(args[0])) {
            if(powercord.pluginManager.isEnabled(args[0])) {
                result = `\`${args[0]}\` is already enabled`
            } else {
            result = `\`${args[0]}\` has been enabled`
            powercord.pluginManager.enable(args[0])
        }} else {
            result = 'You do not have that plugin installed'
        }

        return { 
            send: false,
            result
        }
    },
    autocompleteFunc (args) {
        const plugins = powercord.pluginManager.getPlugins()
            .sort((a, b) => a < b ? -1 : 1 || 0)
            .map(plugin => powercord.pluginManager.plugins.get(plugin));
        if (args.length > 1) {
            return false;
        }
        return {
            commands: plugins
                .filter(plugin => plugin.pluginID !== 'pc-commands' &&
                    plugin.pluginID.includes(args[0].toLowerCase()))
                .map(plugin => ({
                    command: plugin.pluginID,
                    description: plugin.manifest.description
                }))
                .slice(0, 10),
            header: 'powercord plugin list'
        };
    }
}
