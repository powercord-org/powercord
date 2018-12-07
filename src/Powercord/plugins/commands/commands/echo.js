module.exports = {
  name: 'echo',
  description: 'Returns the specified arguments.',
  usage: '/echo [ ...arguments ]',
  func: (args) => ({
    send: false,
    result: args.join(' ')
  })
};
