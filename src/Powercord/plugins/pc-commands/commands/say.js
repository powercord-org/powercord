module.exports = {
  command: 'say',
  description: 'Sends the specified arguments.',
  usage: '{c} [ ...arguments ]',
  showTyping: true,
  executor: (args) => ({
    send: true,
    result: args.join(' ')
  })
};
