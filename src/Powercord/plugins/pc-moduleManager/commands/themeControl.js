// Enable Disable Themes
module.exports = {
    command: 'theme',
    description: 'Enable / Disable a Theme',
    usage: '{t} {c}',
    executor (args) {
      const [ type, theme, ...filtered ] = args;
      let result;

      if (type === "enable") {
        if (powercord.styleManager.themes.has(theme)) {
          if (powercord.styleManager.isEnabled(theme)) {
            result = `->> ERROR: Tried to load an already loaded theme!
                (${theme})`;
          } else {
            powercord.styleManager.enable(theme);
            result = `+>> SUCCESS: Theme loaded!
                (${theme})`;
          }
        } else {
          result = `->> ERROR: Tried to enable a non-installed theme!
              (${theme})`;
        }
      } else {
        if (powercord.styleManager.themes.has(theme)) {
          if (!powercord.styleManager.isEnabled(theme)) {
            result = `->> ERROR: Tried to unload an already unloaded theme!
                (${theme})`;
          } else {
            powercord.styleManager.disable(theme);
            result = `+>> SUCCESS: Theme unloaded!
                (${theme})`;
          }
        } else {
          result = `->> ERROR: Tried to disable a non-installed theme!
              (${theme})`;
        }
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
  
      if (args.length > 2) {
        return false;
      }

      if (args.length == 1) {
        return {
          commands: ["enable", "disable"]
            .filter(type => type.includes(args[0] && args[0].toLowerCase()))
            .map(type => ({
              command: type,
              description: type === "enable" ? "Enable a theme" : "Disable a theme"
            })),
          header: 'powercord theme enable/disable'
        };
      }
  
      return {
        commands: themes
          .filter(theme => theme.entityID.toLowerCase().includes(args[1] && args[1].toLowerCase()))
          .map(theme => ({
            command: theme.entityID,
            description: theme.manifest.description
          })),
        header: 'powercord theme list'
      };
    }
  };
  