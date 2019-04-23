module.exports = {
  command: 'help',
  aliases: [ 'h' ],
  description: 'Gives you a list of commands or information on a specific command.',
  usage: '{c} [ commandName ]',
  func ([ commandName ]) {
    let result;

    if (!commandName) {
      const getPropLength = (command) => command.command.length;

      const longestCommandName = getPropLength(
        powercord.api.commands.commands.sort((a, b) => getPropLength(b) - getPropLength(a))[0]
      );

      result = {
        type: 'rich',
        title: 'List of Commands',
        description: powercord.api.commands.commands
          .map(({ command, description }) =>
            `\`${command.padEnd((longestCommandName * 2) - command.length, ' \u200b')} |\` \u200b \u200b*${description}*`
          )
          .join('\n'),
        footer: {
          text: `Run ${powercord.api.commands.prefix}help <commandName> for more information regarding a specific command.`
        }
      };
    } else {
      const command = powercord.api.commands.commands.find(c => [ c.command, ...c.aliases ].includes(commandName));
      if (!command) {
        result = `Command \`${commandName}\` not found.`;
      } else {
        result = {
          type: 'rich',
          title: `Help for ${commandName}`,
          description: command.description,
          fields: [ {
            name: 'Usage',
            value: `\`\n${command.usage.replace('{c}', powercord.api.commands.prefix + command.command)}\n\``,
            inline: false
          } ]
        };
      }
    }

    return {
      send: false,
      result
    };
  }
};
