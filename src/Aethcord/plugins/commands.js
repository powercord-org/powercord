const Plugin = require('@ac/Plugin');

module.exports = class Commands extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'webpack' ]
    });

    this.commands = new Map(Object.entries({
      help: {
        name: 'help',
        description: 'Gives you a list of commands or information on a specific command.',
        usage: '/help [ commandName ]',
        func: this.help.bind(this)
      },
      echo: {
        name: 'echo',
        description: 'Returns the specified arguments.',
        usage: '/echo [ ...arguments ]',
        func: (args) => ({
          send: false,
          result: args.join(' ')
        })
      }
    }));
  }

  help ([ commandName ]) {
    let result;
    
    if (!commandName) {
      const getPropLength = (command) => {
        if (!command.name) console.log(command);
        return command.name.length;
      };

      const commands = [ ...this.commands.values() ];

      const longestCommandName = getPropLength(
        commands.sort((a, b) => getPropLength(b) - getPropLength(a))[0]
      );
      result = commands
        .map(({ name, description }) =>
          `\`${name.padEnd((longestCommandName * 2) - name.length, ' \u200b')} |\` \u200b \u200b*${description}*`
        )
        .join('\n');
    } else {
      const command = this.commands.get(commandName);
      if (!command) {
        result = `Command \`${commandName}\` not found.`;
      } else {

      }
    }
    return {
      send: false,
      result
    };
  }

  async start () {
    const webpack = aethcord.plugins.get('webpack');
    const messages = await webpack.getModule(webpack.modules.messages[0]);
    const {
      messages: { sendBotMessage },
      channels: { getChannelId }
    } = webpack;

    messages.sendMessage = (sendMessage => async (id, message) => {
      if (message.content.startsWith('/')) {
        const [ command, ...args ] = message.content.slice(1).split(' ');
        if (this.commands.has(command)) {
          const result = await this.commands.get(command).func(args);
          if (!result) return;
          if (result.send) {
            message.content = result.result;
          } else {
            return sendBotMessage(
              getChannelId(),
              result.result
            );
          }
        }
      }

      return sendMessage(id, message);
    })(this.oldSendMessage = messages.sendMessage);
  }

  register (name, description, usage, func) {
    return this.commands.set(name, {
      name, description, usage, func
    });
  }

  async stop () {
    const messages = await webpack.getModule(webpack.modules.messages[0]);
    messages.sendMessage = this.oldSendMessage;
  }
}
