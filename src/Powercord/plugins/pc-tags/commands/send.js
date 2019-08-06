module.exports = {
  command: 'send',
  description: 'Send a tag',
  func: (args, settings) => {
    const result = settings.get(args[0]);
    if (!result) {
      return {
        send: false,
        result: {
          type: 'rich',
          title: `Tag "${args[0]}" does not exist`
        }
      };
    }

    return {
      send: true,
      result
    };
  },
  autocomplete: (args, settings) => {
    if (args[1] !== void 0) {
      return false;
    }

    return {
      header: 'tags available to send',
      commands: settings
        .getKeys()
        .filter(tag => tag.toLowerCase().includes(args[0].toLowerCase()))
        .map(tag => ({
          command: tag,
          description: settings.get(tag)
        }))
    };
  }
};
