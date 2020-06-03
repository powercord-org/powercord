module.exports = {
  command: 'view',
  description: 'View a tag',
  executor: (args, main) => {
    if (!main.settings.get(args[0])) {
      return {
        send: false,
        result: {
          type: 'rich',
          title: `Tag "${args[0]}" does not exist`
        }
      };
    }

    return {
      send: false,
      result: {
        type: 'rich',
        title: args[0],
        description: main.settings.get(args[0])
      }
    };
  },
  autocomplete: (args, settings) => {
    if (args[1] !== void 0) {
      return false;
    }

    return {
      header: 'Tags available to view',
      commands: settings
        .getKeys()
        .filter(tag => tag.toLowerCase().includes(args[0]))
        .map(tag => ({
          command: tag,
          description: settings.get(tag)
        }))
    };
  }
};
