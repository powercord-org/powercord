module.exports = {
  command: 'echo',
  description: 'Returns the specified arguments.',
  usage: '{c} [ ...arguments ]',
  func: (args) => ({
    send: false,
    result: args.join(' ')
  })
};
