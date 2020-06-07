const { ipcRenderer } = require('electron');
const { React, i18n: { Messages }, typing, getModuleByDisplayName } = require('powercord/webpack');
const { inject } = require('powercord/injector');

const Title = require('./components/Title');
const Command = require('./components/Command');

let state;
module.exports = async function injectAutocomplete () {
  const ChannelAutocomplete = await getModuleByDisplayName('ChannelAutocomplete');

  function renderCommandResults (query, selected, commands, onClick, onHover, formatCommand, formatHeader, customHeader) {
    const renderHeader = function (query, formatHeader) {
      const title = query.length > 0 ? Messages.COMMANDS_MATCHING.format({ prefix: formatHeader(query) }) : Messages.COMMANDS;

      return React.createElement(Title, {
        title: customHeader || [ 'Powercord ', title ]
      }, `autocomplete-title-${title}`);
    };

    if (!commands || commands.length === 0) {
      return null;
    }

    const results = commands.map((command, index) => React.createElement(Command, Object.assign({
      onClick,
      onHover,
      selected: selected === index,
      index
    }, formatCommand(command, index))));

    return [ renderHeader(query, formatHeader), results ];
  }

  inject('pc-commands-autocomplete-prefix', ChannelAutocomplete.prototype, 'getAutocompletePrefix', function (_, res) {
    const { props: { textValue }, state: { autocompleteOptions } } = this;
    const { prefix } = powercord.api.commands;

    const textarea = this.props.editorRef.current;
    if (!textarea || !textValue.startsWith(prefix)) {
      return res;
    }

    const [ command, ...args ] = textValue.slice(prefix.length).split(' ');
    const currentWord = textarea.getCurrentWord();

    const currentCommand = powercord.api.commands.find(c => [ c.command, ...(c.aliases || []) ].includes(command));
    if (!currentCommand || !currentCommand.showTyping) {
      typing.stopTyping(this.props.channel.id);
    }

    currentWord.word = command && args[0] ? `${prefix}${command} ${args.join(' ')}` : textValue;
    currentWord.isAtStart = args.length === 0 || (currentCommand && !currentCommand.autocomplete);

    const { word, isAtStart } = currentWord;

    const query = word ? word.slice(isAtStart || command ? prefix.length : 0).toLowerCase() : '';
    const type = Object.keys(autocompleteOptions).find(option => autocompleteOptions[option].matches(isAtStart ? prefix : word, query, isAtStart));

    return {
      prefix: word,
      query,
      type
    };
  });

  inject('pc-commands-autocomplete', ChannelAutocomplete.prototype, 'render', function (_, res) {
    const { props: { textValue }, state: { autocompleteOptions } } = this;
    const resultFilter = (value) => c => [ c.command, ...(c.aliases || []) ].some(commandName =>
      commandName.includes(value)
    );

    autocompleteOptions.POWERCORD_COMMANDS = {
      matches: (prefix, _, isAtStart) => isAtStart && prefix === powercord.api.commands.prefix,
      queryResults: (value) => ({ commands: powercord.api.commands.filter(resultFilter(value)) }),
      renderResults: (query, selected, onHover, onClick, autocompletes) => {
        if (autocompletes && autocompletes.commands) {
          return renderCommandResults(query, selected, autocompletes.commands, onClick, onHover, (c) => ({
            command: c.command,
            description: c.description,
            key: c.command
          }), (query) => powercord.api.commands.prefix + query.slice(powercord.api.commands.prefix.length - 1));
        }
      },
      getPlainText: (index, { commands }) => `${!powercord.api.commands.prefix.endsWith(' ') ? powercord.api.commands.prefix : ''}${commands[index].command}`,
      getRawText (...args) {
        return this.getPlainText(...args);
      }
    };

    autocompleteOptions.POWERCORD_AUTOCOMPLETE = {
      matches: (_, value, isAtStart) => !isAtStart && powercord.api.commands.filter(command => command.autocomplete).find(resultFilter(value.split(' ')[0])),
      queryResults: (value) => {
        const currentCommand = powercord.api.commands.find(resultFilter(value.split(' ')[0]));
        if (!currentCommand) {
          return false;
        }

        if (currentCommand.autocomplete) {
          const autocompleteRows = currentCommand.autocomplete(value.split(' ').slice(1));

          if (autocompleteRows) {
            autocompleteRows.commands.__header = [ autocompleteRows.header ];
            delete autocompleteRows.header;
          }

          return autocompleteRows;
        }
      },
      renderResults: (query, selected, onHover, onClick, autocompletes) => {
        if (state) {
          return [ null, [] ];
        }

        if (autocompletes && autocompletes.commands) {
          const customHeader = Array.isArray(autocompletes.commands.__header) ? autocompletes.commands.__header : [ autocompletes.commands.__header ];

          return renderCommandResults(query, selected, autocompletes.commands, onClick, onHover, (e) => ({
            prefix: query.slice(powercord.api.commands.prefix.length - 1).split(' ')[0],
            command: e.command,
            description: e.description,
            key: e.command
          }), () => void 0, customHeader);
        }
      },
      getPlainText: (index, { commands }) => {
        if (commands[index].wildcard) {
          state = true;

          setImmediate(() => {
            ipcRenderer.invoke('pc-sendInputEvent', {
              type: 'char',
              keyCode: '\u000d'
            });

            state = false;
          });

          return textValue.split(' ').pop();
        } else if (commands[index].instruction) {
          setImmediate(() => {
            ipcRenderer.invoke('pc-sendInputEvent', {
              type: 'keyDown',
              keyCode: 'Backspace'
            });
          });

          return '';
        }

        return commands[index].command;
      },
      getRawText (...args) {
        return this.getPlainText(...args);
      }
    };

    return res;
  });
};
