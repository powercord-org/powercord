module.exports = {
    command: 'enable',
    description: 'Allows you to enable a selected theme from the given list.',
    usage: '{c} [ theme ID ]',
    executor (args) {
      let result;
  
      if (powercord.styleManager.themes.has(args[0])) {
        if (powercord.styleManager.isEnabled(args[0])) {
          result = `->> ERROR: Tried to load an already loaded theme!
              (${args[0]})`;
        } else {
          powercord.styleManager.enable(args[0]);
          result = `+>> SUCCESS: Theme loaded!
              (${args[0]})`;
        }
      } else {
        result = `->> ERROR: Tried to enable a non-installed theme!
            (${args[0]})`;
      }
  
      return {
        send: false,
        result: `\`\`\`diff\n${result}\`\`\``
      };
    },
    autocomplete (args) {
      const themes = powercord.styleManager.getThemes()
        .sort((a, b) => a - b)
        .map(theme => powercord.styleManager.themes.get(theme));
  
      if (args.length > 1) {
        return false;
      }
  
      return {
        commands: themes
          .filter(theme => theme.entityID.includes(args[0]))
          .map(theme => ({
            command: theme.entityID,
            description: theme.manifest.description
          }))
          .slice(0, 10),
        header: 'powercord theme list'
      };
    }
  };