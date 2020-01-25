const { webContents } = require('electron').remote.getCurrentWindow();
const { getModule, getModuleByDisplayName } = require('powercord/webpack');
const { inject } = require('powercord/injector');

let state;
module.exports = async function injectAutocomplete () {
  const _this = this;
  const ChannelAutocomplete = await getModuleByDisplayName('ChannelAutocomplete');
  inject('pc-commands-autocomplete', ChannelAutocomplete.prototype, 'render', function (_, res) {
    const { textValue } = this.props;
    const currentCommandFilter = (command) => [ command.command, ...command.aliases ].some(commandName =>
      textValue.startsWith(powercord.api.commands.prefix) &&
      (textValue.slice(powercord.api.commands.prefix.length).toLowerCase()).startsWith(commandName)
    );

    const autocompleteFunc = () => {
      const currentCommand = powercord.api.commands.commands.find(currentCommandFilter);
      if (!currentCommand) {
        return false;
      }

      const autocompleteRows = currentCommand.autocompleteFunc(
        textValue.slice(powercord.api.commands.prefix.length).split(' ').slice(1)
      );

      if (autocompleteRows) {
        autocompleteRows.commands.__header = [ autocompleteRows.header ];
        delete autocompleteRows.header;
      }

      return autocompleteRows;
    };

    const { autocompleteOptions } = this.state;
    autocompleteOptions.POWERCORD_AUTOCOMPLETE = {
      matches: () => powercord.api.commands.commands.filter(command => command.autocompleteFunc)
        .some(currentCommandFilter) && autocompleteFunc(),
      queryResults: autocompleteFunc,
      renderResults: (...args) => {
        if (state) {
          return [ null, [] ];
        }

        const customHeader = Array.isArray(args[4].commands.__header)
          ? args[4].commands.__header
          : [ args[4].commands.__header ];

        const renderedResults = autocompleteOptions.COMMAND.renderResults(...args);
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
      },
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

          return textValue.split(' ').pop();
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
      getRawText: (...args) => autocompleteOptions.POWERCORD_AUTOCOMPLETE.getPlainText(...args)
    };

    _this.instance = this;

    return res;
  });

  const autocomplete = await getModule([ 'getAutocompleteOptions' ]);
  autocomplete.getAutocompleteOptions = (getAutocompleteOptions => (e, t, n, r, a) => {
    const autocompleteOptions = getAutocompleteOptions(e, t, n, r, a);
    autocompleteOptions.POWERCORD_COMMANDS = {
      matches: (prefix, value, isAtStart) => isAtStart && (prefix + value).startsWith(powercord.api.commands.prefix),
      queryResults: (value) => ({ commands: powercord.api.commands.commands.filter(({ command }) =>
        command.startsWith(value.slice(powercord.api.commands.prefix.length - 1).toLowerCase())
      ) }),
      renderResults: (...args) => {
        const renderedResults = autocompleteOptions.COMMAND.renderResults(...args);
        if (!renderedResults) {
          return;
        }

        const [ header, commands ] = renderedResults;
        header.type = class PatchedHeaderType extends header.type {
          renderContent (...originalArgs) {
            const rendered = super.renderContent(...originalArgs);
            if (typeof rendered.props.children === 'string') {
              rendered.props.children = 'Powercord Commands';
            }

            if (Array.isArray(rendered.props.children) && rendered.props.children[1]) {
              const index = typeof rendered.props.children[1] === 'string' ? 0 : 1;
              const commandPreviewChildren = rendered.props.children[index].props.children;
              if (commandPreviewChildren[0].startsWith('/')) {
                commandPreviewChildren[0] = commandPreviewChildren[0].replace(
                  `/${powercord.api.commands.prefix.slice(1)}`, powercord.api.commands.prefix
                );
              }

              if (commandPreviewChildren[0] === powercord.api.commands.prefix) {
                rendered.props.children = 'Powercord Commands';
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
                delete children[0].props;

                children[0].type = children[2].type;
                children[0].props = {
                  children: powercord.api.commands.prefix,
                  style: { color: '#72767d' }
                };
              }

              return rendered;
            }
          };
        }

        return [ header, commands ];
      },
      getPlainText: (index, { commands }) => powercord.api.commands.prefix + commands[index].command,
      getRawText: (...args) => autocompleteOptions.POWERCORD_COMMANDS.getPlainText(...args)
    };

    return autocompleteOptions;
  })(autocomplete.__getAutocompleteOptions = autocomplete.getAutocompleteOptions);
};
