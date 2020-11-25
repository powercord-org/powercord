module.exports = {
  command: 'list',
  description: 'Get a list of all tags you have',
  executor: (_, { settings }) => {
    const keys = settings.getKeys();

    return {
      send: false,
      result: {
        type: 'rich',
        title: `You have ${keys.length} ${keys.length == 1 ? 'tag' : 'tags'} available:`,
        description: keys.map(key => `- ${key}`).join('\n')
      }
    };
  }
};
