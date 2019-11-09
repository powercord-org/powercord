const { inject: pcInject } = require('powercord/injector');
const { waitFor, getOwnerInstance, sleep } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { webContents } = require('electron').remote.getCurrentWindow();

module.exports = async function injectAutocomplete () {
  let state;
  const disabledPlugins = powercord.settings.get('disabledPlugins', []);
  const plugins = [ ...powercord.pluginManager.plugins.keys() ]
    .filter(plugin => !disabledPlugins.includes(plugin));
  while (!plugins.every(plugin => powercord.pluginManager.get(plugin))) { // ugly fix lol
    await sleep(1);
  }

  const inject = () => {
    const powercordCommands = {
      getPlainText: (index, { commands }) => powercord.api.commands.prefix + commands[index].command,
      getRawText: (...args) => powercordCommands.getPlainText(...args),
      matches: (isValid) => (
        isValid &&
        this.instance.props.value.startsWith(powercord.api.commands.prefix) &&
        !this.instance.props.value.includes(' ')
      ),
      queryResults: () => ({
        commands: powercord.api.commands.commands.filter(c =>
          c.command.startsWith(this.instance.props.value.slice(powercord.api.commands.prefix.length).toLowerCase())
        )
      }),
      renderResults: (...args) => {
        const renderedResults = this.instance.props.autocompleteOptions.COMMAND.renderResults(...args);
        if (!renderedResults) {
          return;
        }

        const [ header, commands ] = renderedResults;

        header.type = class PatchedHeaderType extends header.type {
          renderContent (...originalArgs) {
            const rendered = super.renderContent(...originalArgs);

            if (
              Array.isArray(rendered.props.children) &&
              rendered.props.children[1]
            ) {
              const commandPreviewChildren = rendered.props.children[1].props.children;
              if (commandPreviewChildren[0].startsWith('/')) {
                commandPreviewChildren[0] = commandPreviewChildren[0]
                  .replace(`/${powercord.api.commands.prefix.slice(1)}`, powercord.api.commands.prefix);
              }
            }

            return rendered;
          }
        };

        for (const command of commands) {
          command.type = class PatchedCommandType extends command.type {
            renderContent (...originalArgs) {
              const rendered = super.renderContent(...originalArgs);

              const { children } = rendered.props;
              if (children[0].props.name === 'Slash') {
                rendered.props.children.shift();
              }

              const commandName = children[0].props;
              if (!commandName.children.startsWith(powercord.api.commands.prefix)) {
                commandName.children = powercord.api.commands.prefix + commandName.children;
              }

              return rendered;
            }
          };
        }

        return [ header, commands ];
      }
    };

    const currentCommandFilter = command =>
      [ command.command, ...command.aliases ].some(commandName =>
        this.instance.props.value.startsWith(powercord.api.commands.prefix) &&
        (this.instance.props.value.slice(powercord.api.commands.prefix.length).toLowerCase()).startsWith(commandName)
      );
    const autocompleteFunc = () => {
      const currentCommand = powercord.api.commands.commands
        .find(currentCommandFilter);
      if (!currentCommand) {
        return false;
      }

      const autocompleteRows = currentCommand.autocompleteFunc(
        this.instance.props.value
          .slice(powercord.api.commands.prefix.length)
          .split(' ')
          .slice(1)
      );

      if (autocompleteRows) {
        autocompleteRows.commands.__header = [ autocompleteRows.header ];
        delete autocompleteRows.header;
      }

      return autocompleteRows;
    };

    const powercordAutocomplete = {
      getPlainText: (index, { commands }) => {
        if (commands[index].wildcard) {
          state = true;
          setImmediate(() => {
            webContents.sendInputEvent({
              type: 'char',
              keyCode: '\u000d'
            });
            state = false;
          });
          return this.instance.props.value.split(' ').pop();
        } else if (commands[index].instruction) {
          setImmediate(() => {
            webContents.sendInputEvent({
              type: 'keyDown',
              keyCode: 'Backspace'
            });
          });
          return '';
        }

        return commands[index].command;
      },
      getRawText: (...args) => powercordAutocomplete.getPlainText(...args),
      matches: () =>
        powercord.api.commands.commands
          .filter(command => command.autocompleteFunc)
          .some(currentCommandFilter) &&
        autocompleteFunc(),
      queryResults: autocompleteFunc,
      renderResults: (...args) => {
        if (state) {
          return [ null, [] ];
        }

        const customHeader = Array.isArray(args[4].commands.__header)
          ? args[4].commands.__header
          : [ args[4].commands.__header ];

        const renderedResults = this.instance.props.autocompleteOptions.COMMAND.renderResults(...args);
        if (!renderedResults) {
          return;
        }

        const [ header, commands ] = renderedResults;

        header.type = class PatchedHeaderType extends header.type {
          render () {
            const rendered = super.render();
            if (!customHeader[0]) {
              rendered.props.children.props.children = null;
              rendered.props.children.props.style = { padding: '4px' };
            }
            return rendered;
          }

          renderContent (...originalArgs) {
            const rendered = super.renderContent(...originalArgs);
            rendered.props.children = customHeader;
            return rendered;
          }
        };

        for (const command of commands) {
          command.type = class PatchedCommandType extends command.type {
            renderContent (...originalArgs) {
              const rendered = super.renderContent(...originalArgs);
              const commandObj = args[4].commands[commands.indexOf(command)];

              const { children } = rendered.props;
              if (children[0].props.name === 'Slash') {
                rendered.props.children.shift();
              }

              const commandName = children[0].props;
              commandName.children = commandObj.command;

              return rendered;
            }
          };
        }

        return [ header, commands ];
      }
    };

    this.instance.props.autocompleteOptions.POWERCORD_CUSTOM_COMMANDS_AUTOCOMPLETE = powercordAutocomplete;
    this.instance.props.autocompleteOptions.POWERCORD_CUSTOM_COMMANDS = powercordCommands;
  };

  const taClass = (await getModule([ 'channelTextArea', 'channelTextAreaEnabled' ]))
    .channelTextArea.split(' ')[0];

  const element = await waitFor(`.${taClass}`);
  this.instance = getOwnerInstance(element);

  pcInject('pc-commands-autocomplete', this.instance.__proto__, 'render', (args, originReturn) => {
    setImmediate(() => {
      const element = document.querySelector(`.${taClass}`);
      if (element) {
        this.instance = getOwnerInstance(element);
        inject();
      }
    });
    return originReturn;
  });

  inject();
};
