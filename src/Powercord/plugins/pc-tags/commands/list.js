module.exports = {
  command: 'list',
  description: 'Get a list of all tags you have',
  func: (_, settings) => {
    const keys = settings.getKeys();

    return {
      send: false,
      result: {
        type: 'rich',
        title: `You have ${keys.length} tags available:`,
        description: keys.map(key => `- ${key}`).join('\n')
      }
    };
  },
  autocomplete: () => false
};
