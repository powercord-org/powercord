const Plugin = require('@ac/Plugin');

module.exports = class Commands extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'webpack' ]
    });

    this.commands = new Map([
      [ 'echo', (args) => ({ isLocal: true, result: args.join(' ') }) ]
    ]);
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
          const result = await this.commands.get(command)(args, command);
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

  register (name, func) {
    return this.commands.set(name, func);
  }

  async stop () {
    const messages = await webpack.getModule(webpack.modules.messages[0]);
    messages.sendMessage = this.oldSendMessage;
  }
}