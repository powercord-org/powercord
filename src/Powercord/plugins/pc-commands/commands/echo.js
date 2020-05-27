module.exports = {
  command: 'echo',
  description: 'Returns the specified arguments.',
  usage: '{c} [ ...arguments ]',
  executor: (args) => ({
    send: false,
    result: args.join(' ')
  })
};
