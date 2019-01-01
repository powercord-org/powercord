module.exports = {
  name: 'lmgtfy',
  description: 'Let me google that for you...',
  usage: '{c} [ ...search terms ]',
  func: (args) => ({
    send: true,
    result: `https://lmgtfy.com/?q=${encodeURI(args.join('+'))}`
  })
};
