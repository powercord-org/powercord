const { React, i18n: { Messages }, getModuleByDisplayName, getModule, typing } = require('powercord/webpack');
const { AdvancedScrollerThin } = require('powercord/components');
const { inject } = require('powercord/injector');

const Title = require('./components/Title');
const Command = require('./components/Command');

module.exports = async function injectAutocomplete () {
  const messages = await getModule([ 'sendMessage', 'editMessage' ]);
  function renderHeader (value, formatHeader, customHeader) {
    const title = value.length > 0 ? Messages.COMMANDS_MATCHING.format({ prefix: formatHeader(value) }) : Messages.COMMANDS;
    return React.createElement(Title, { title: customHeader || [ 'Powercord ', title ] }, 'autocomplete-title-Commands');
  }

  function renderCommandResults (value, selected, commands, onHover, onClick, formatCommand, formatHeader, customHeader) {
    if (!commands || commands.length === 0) {
      return null;
    }

    const results = commands.map((command, index) => React.createElement(Command, Object.assign({
      onClick,
      onHover,
      selected: selected === index,
      index
    }, formatCommand(command, index))));

    return React.createElement(React.Fragment, {}, renderHeader(value, formatHeader, customHeader), results.length > 10
      ? React.createElement(AdvancedScrollerThin, { style: { height: '337px' } }, results)
      : results
    );
  }

  function getMatchingCommand (c) {
    return [ c.command.toLowerCase(), ...(c.aliases?.map((alias) => alias.toLowerCase()) || []) ];
  }

  const { AUTOCOMPLETE_OPTIONS: AutocompleteTypes, AUTOCOMPLETE_PRIORITY: AutocompletePriority } = await getModule([ 'AUTOCOMPLETE_OPTIONS' ]);
  if (!AutocompletePriority.includes('POWERCORD')) {
    AutocompletePriority.unshift('POWERCORD_AUTOCOMPLETE');
    AutocompletePriority.unshift('POWERCORD');
  }

  AutocompleteTypes.POWERCORD_AUTOCOMPLETE = {
    get sentinel () {
      return powercord.api.commands.prefix;
    },
    matches: (_channel, _guild, value, start) => start && value.includes(' ') && powercord.api.commands.find(c => (getMatchingCommand(c)).includes(value.split(' ')[0])),
    queryResults: (_channel, _guild, value) => {
      const currentCommand = powercord.api.commands.find(c => (getMatchingCommand(c)).includes(value.split(' ')[0]));
      if (currentCommand.autocomplete) {
        const autocompleteRows = currentCommand.autocomplete(value.split(' ').slice(1));
        if (autocompleteRows) {
          autocompleteRows.value = value;
          autocompleteRows.commands.__header = [ autocompleteRows.header ];
          delete autocompleteRows.header;
          return { results: autocompleteRows };
        }
      }

      return { results: {} };
    },
    renderResults: ({ results: result, selectedIndex: selected, query: value, onHover: onHover, onClick: onClick }) => {
      if (result && result.commands) {
        const { commands } = result;
        const customHeader = Array.isArray(commands.__header) ? commands.__header : [ commands.__header ];

        return renderCommandResults(value, selected, commands, onHover, onClick, c => ({
          key: `powercord-${c.command}`,
          command: {
            name: c.command,
            ...c
          },
          prefix: value.split(' ')[0]
        }), () => void 0, customHeader);
      }
    },
    onSelect: (result, selected, isEnter, props) => {
      if (result.commands[selected].instruction) {
        if (isEnter) {
          const msg = `${powercord.api.commands.prefix}${result.value}`;
          messages.sendMessage('0', { content: msg });
          this.instance.clearValue();
        } else if (!result.value.endsWith(' ')) {
          props.insertText(result.value);
        }

        return {};
      }

      props.insertText(result.commands[selected].command);
      return {};
    }
  };

  AutocompleteTypes.POWERCORD = {
    get sentinel () {
      return powercord.api.commands.prefix;
    },
    matches: (_channel, _guild, value, start) => start && powercord.api.commands.filter(c => (getMatchingCommand(c)).some(commandName => commandName.includes(value))).length,
    queryResults: (_channel, _guild, value) => ({
      results: {
        commands: powercord.api.commands.filter(c => (getMatchingCommand(c)).some(commandName => commandName.includes(value)))
      }
    }),
    renderResults: ({ results: result, selectedIndex: selected, query: value, onHover: onHover, onClick: onClick }) => {
      if (result && result.commands) {
        return renderCommandResults(value, selected, result.commands, onHover, onClick, c => ({
          key: `powercord-${c.command}`,
          command: {
            name: c.command,
            ...c
          }
        }), (value) => `${powercord.api.commands.prefix}${value}`);
      }
    },
    onSelect: (result, selected, _, props) => {
      props.insertText(`${powercord.api.commands.prefix}${result.commands[selected].command}`);
      return {};
    }
  };

  const _this = this;
  const ChannelEditorContainer = await getModuleByDisplayName('ChannelEditorContainer');
  inject('pc-commands-textarea', ChannelEditorContainer.prototype, 'render', function (_, res) {
    _this.instance = this;
    return res;
  });

  /* Silent command typing */
  typing.startTyping = (startTyping => (channel) => setImmediate(() => {
    if (this.instance && this.instance.props) {
      const { textValue } = this.instance.props;
      const currentCommand = powercord.api.commands.find(c => (getMatchingCommand(c)).includes(textValue.slice(powercord.api.commands.prefix.length).split(' ')[0]));
      if (textValue.startsWith(powercord.api.commands.prefix) && (!currentCommand || (currentCommand && !currentCommand.showTyping))) {
        return typing.stopTyping(channel);
      }
      startTyping(channel);
    }
  }))(this.oldStartTyping = typing.startTyping);

  inject('pc-commands-slate-autocomplete', ChannelEditorContainer.prototype, 'getCurrentWord', function (_, res) {
    if (new RegExp(`^\\${powercord.api.commands.prefix}\\S+ `).test(this.props.textValue)) {
      if ((/^@|#|:/).test(res.word)) {
        return res;
      }

      return {
        word: this.props.textValue,
        isAtStart: true
      };
    }
    return res;
  });
};
