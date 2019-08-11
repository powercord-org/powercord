module.exports = {
    command: 'disable',
    description: 'Disable a plugin',
    usage: '{c} [ Plugin Name ]',
    aliases: [],
    func: (args) => {
        let result;
        if(powercord.pluginManager.plugins.has(args[0])) {
            if(args[0].toLowerCase() === 'pc-commands') {
                result = 'You cannot disable that!'
            } else if(!powercord.pluginManager.isEnabled(args[0])) {
                result = `\`${args[0]}\` is already disabled`
            } else {
            result = `\`${args[0]}\` has been disabled`
            powercord.pluginManager.disable(args[0])
        }} else {
            result = 'You do not have that plugin installed'
        }

        return { 
            send: false,
            result
        }
    }
}