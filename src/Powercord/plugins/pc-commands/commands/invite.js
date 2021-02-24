module.exports = {
    command: 'invite',
    description: 'Sends an invite to the Powercord discord server in the chat you are in',
    usage: '{c}',
    showTyping: true,
    executor: (args) => ({
      send: true,
      result: 'https://discord.gg/gs4ZMbBfCh',
    })
  };