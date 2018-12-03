module.exports = {
  name: 'help',
  description: 'Gives you a list of commands or information on a specific command.',
  usage: '/help [ commandName ]',
  func: ([ commandName ]) => {
    let result;

    if (!commandName) {
      const getPropLength = (command) => command.name.length;

      const commands = [ ...this.commands.values() ];

      const longestCommandName = getPropLength(
        commands.sort((a, b) => getPropLength(b) - getPropLength(a))[0]
      );

      result = {
        type: 'rich',
        title: 'List of Commands',
        description: commands
          .map(({ name, description }) =>
            `\`${name.padEnd((longestCommandName * 2) - name.length, ' \u200b')} |\` \u200b \u200b*${description}*`
          )
          .join('\n'),
        footer: {
          text: 'Run /help <commandName> for more information regarding a specific command.'
        }
      };
    } else {
      const command = this.commands.get(commandName);
      if (!command) {
        result = `Command \`${commandName}\` not found.`;
      } else {
        result = {
          type: 'rich',
          title: `Help for ${commandName}`,
          description: command.description,
          fields: [ {
            name: 'Usage',
            value: `\`\`\`\n${command.usage}\n\`\`\``,
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
