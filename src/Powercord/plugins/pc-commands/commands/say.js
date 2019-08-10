module.exports = {
  command: 'say',
  description: 'Sends the specified arguments.',
  usage: '{c} [ ...arguments ]',
  func: (args) => ({
    send: true,
    result: args.join(' ')
  })
};
