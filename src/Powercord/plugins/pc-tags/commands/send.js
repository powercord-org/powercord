module.exports = {
  command: 'send',
  description: 'Send a tag',
  func: (args, settings) => {
    const tagName = args.shift();
    const result = settings.get(tagName);
    if (!result) {
      return {
        send: false,
        result: {
          type: 'rich',
          title: `Tag "${tagName}" does not exist`
        }
      };
    }

    return {
      send: true,
      result: result.replace(/\$\$(@|\d+)/g, (match, idx) => (
        match === '$$@'
          ? args.join(' ')
          : args[idx - 1]
      ))
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
