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
    }
}