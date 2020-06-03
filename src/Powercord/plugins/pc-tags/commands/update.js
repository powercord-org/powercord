const getPrefix = () => powercord.api.commands.prefix;

module.exports = {
  command: 'update',
  description: 'Update a tag',
  executor: (args, main) => {
    if (args.length < 2) {
      return {
        send: false,
        result: {
          type: 'rich',
          title: 'Missing required arguments',
          footer: { text: `Refer to ${getPrefix()}help tag` }
        }
      };
    }

    const name = args.shift();
    if (!main.settings.get(name)) {
      return {
        send: false,
        result: {
          type: 'rich',
          title: `Tag "${name}" doesn't exist`
        }
      };
    }

    main.settings.set(name, args.join(' '));
    main.reloadTag(name);

    return {
      send: false,
      result: {
        type: 'rich',
        title: 'Successfully updated tag',
        color: 0x00FF00,
        fields: [ {
          name: 'Name',
          value: name,
          inline: false
        }, {
          name: 'Value',
          value: args.join(' '),
          inline: false
        } ]
      }
    };
  },
  autocomplete: (args, settings) => {
    if (args[1] === void 0) {
      return {
        header: 'Tags available to update',
        commands: settings
          .getKeys()
          .filter(tag => tag.toLowerCase().includes(args[0]))
          .map(tag => ({
            command: tag,
            description: settings.get(tag)
          }))
      };
    }

    return {
      commands: [ {
        command: `Enter the updated content of "${args[0]}"...`,
        wildcard: true
      } ]
    };
  }
};
