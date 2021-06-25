const { React, i18n: { Messages }, getModuleByDisplayName, getModule, typing } = require('powercord/webpack');
const { AdvancedScrollerThin } = require('powercord/components');
const { getOwnerInstance } = require('powercord/util');
const { inject } = require('powercord/injector');

const Title = require('./components/Title');
const Command = require('./components/Command');

module.exports = async function injectAutocomplete () {
  this.classes = {
    ...await getModule([ 'channelTextArea', 'inner' ])
  };

  function renderHeader (value, formatHeader, customHeader) {
    const title = value.length > 0 ? Messages.COMMANDS_MATCHING.format({ prefix: formatHeader(value) }) : Messages.COMMANDS;

    return React.createElement(Title, {
      title: customHeader || [ 'Powercord ', title ]
    }, 'autocomplete-title-Commands');
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
    return [ c.command.toLowerCase(), ...(c.aliases?.map(alias => alias.toLowerCase()) || []) ];
  }

  const { AUTOCOMPLETE_OPTIONS: AutocompleteTypes, AUTOCOMPLETE_PRIORITY: AutocompletePriority } = await getModule([ 'AUTOCOMPLETE_OPTIONS' ]);
  if (!AutocompletePriority.includes('POWERCORD')) {
    AutocompletePriority.push('POWERCORD')
    AutocompletePriority.push('POWERCORD_AUTOCOMPLETE')
  }

  AutocompleteTypes.POWERCORD_AUTOCOMPLETE = {
    get sentinel () { return powercord.api.commands.prefix },
    matches: (_channel, _guild, value) => value.includes(' ') && powercord.api.commands.find(c => (getMatchingCommand(c)).includes(value.split(' ')[0])),
    queryResults: (_channel, _guild, value) => {
      const currentCommand = powercord.api.commands.find(c => (getMatchingCommand(c)).includes(value.split(' ')[0]));
      if (currentCommand.autocomplete) {
        const autocompleteRows = currentCommand.autocomplete(value.split(' ').slice(1));
        if (autocompleteRows) {
          autocompleteRows.value = value
          autocompleteRows.commands.__header = [ autocompleteRows.header ];
          delete autocompleteRows.header;
        }
        return { results: autocompleteRows };
      }
    },
    renderResults: (result, selected, channel, guild, value, props, onHover, onClick) => {
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
    onSelect: (result, selected, _, props) => {
      const value = result.value.split(' ').slice(0, -1).join(' ')
      props.insertText(`${powercord.api.commands.prefix}${value} ${result.commands[selected].command}`)
      return {}
    }
  };

  AutocompleteTypes.POWERCORD = {
    get sentinel () { return powercord.api.commands.prefix },
    matches: (_channel, _guild, value) => powercord.api.commands.filter(c => (getMatchingCommand(c)).some(commandName => commandName.includes(value))).length,
    queryResults: (_channel, _guild, value) => ({
      results: {
        commands: powercord.api.commands.filter(c => (getMatchingCommand(c)).some(commandName => commandName.includes(value)))
      }
    }),
    renderResults: (result, selected, _channel, _guild, value, _props, onHover, onClick) => {
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
      props.insertText(`${powercord.api.commands.prefix}${result.commands[selected].command}`)
      return {}
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

  const PlainTextArea = await getModuleByDisplayName('PlainTextArea');
  inject('pc-commands-plain-autocomplete', PlainTextArea.prototype, 'getCurrentWord', function (_, res) {
    const { value } = this.props;
    if (new RegExp(`^\\${powercord.api.commands.prefix}\\S+ `).test(value)) {
      if ((/^@|#|:/).test(res.word)) {
        return res;
      }

      return {
        word: value,
        isAtStart: true
      };
    }
    return res;
  });

  const SlateChannelTextArea = await getModuleByDisplayName('SlateChannelTextArea');
  inject('pc-commands-slate-autocomplete', SlateChannelTextArea.prototype, 'getCurrentWord', function (_, res) {
    const { value } = this.editorRef;
    const { selection, document } = value;
    if (new RegExp(`^\\${powercord.api.commands.prefix}\\S+ `).test(document.text)) {
      if ((/^@|#|:/).test(res.word)) {
        return res;
      }

      const node = document.getNode(selection.start.key);
      if (node) {
        return {
          word: node.text.substring(0, selection.start.offset),
          isAtStart: true
        };
      }
    }
    return res;
  });
};
