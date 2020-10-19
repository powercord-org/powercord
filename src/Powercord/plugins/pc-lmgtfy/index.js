const { Plugin } = require('powercord/entities');

const Constants = Object.freeze({
  SEARCH_ENGINES: {
    google: 'g',
    lmgtfy: 'l',
    bing: 'b',
    yahoo: 'y',
    aol: 'a',
    ask: 'k',
    duckduckgo: 'd',
    snopes: 's',
    startpage: 't'
  },
  SEARCH_TYPES: {
    web: 'w',
    images: 'i',
    videos: 'v',
    news: 'n',
    shopping: 's'
  }
});

const Settings = require('./Settings');

module.exports = class LMGTFY extends Plugin {
  startPlugin () {
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'LMGTFY',
      render: Settings
    });

    powercord.api.commands.registerCommand({
      command: 'lmgtfy',
      description: 'Let me Google that for you...',
      usage: '{c} [--iie] [...search terms] <search engine> <search type>',
      executor: this.handleCommand.bind(this),
      autocomplete: this.handleAutocomplete.bind(this)
    });
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings(this.entityID);
    powercord.api.commands.unregisterCommand('lmgtfy');
  }

  handleCommand (args) {
    if (args.length < 1) {
      return;
    }

    const iie = args[0].includes('--iie') ? !!args.splice(args.indexOf('--iie'), 1) : this.settings.get('iie', false);
    const options = args.slice(-2).map(arg => arg.toLowerCase());
    const params = {};
    params.searchEngine = Constants.SEARCH_ENGINES.google;

    for (const key of Object.keys(Constants)) {
      if (key === 'SEARCH_ENGINES') {
        for (const searchEngine of Object.keys(Constants[key])) {
          for (let i = 0; i < options.length; i++) {
            const match = options[i].toLowerCase() === searchEngine;
            if (match) {
              params.searchEngine = Constants.SEARCH_ENGINES[searchEngine];
              args.splice(args.lastIndexOf(searchEngine), 1);
              options.splice(i, 1);
              break;
            }
          }
        }
      } else if (key === 'SEARCH_TYPES') {
        for (const searchType of Object.keys(Constants[key])) {
          for (let i = 0; i < options.length; i++) {
            const match = options[i].toLowerCase() === searchType;
            if (match) {
              if (params.searchEngine === 'g') {
                params.searchType = Constants.SEARCH_TYPES[searchType];
                args.splice(args.lastIndexOf(searchType), 1);
              }
            }
          }
        }
      }
    }

    const { searchEngine, searchType } = params;
    const queryString = new URLSearchParams();
    queryString.append('q', args.join(' '));
    if (searchType) {
      queryString.append('s', searchEngine);
      queryString.append('t', searchType);
    } else if (searchEngine !== 'g') {
      queryString.append('s', searchEngine);
    }

    if (iie) {
      queryString.append('iie', +iie);
    }

    return {
      send: true,
      result: `<https://lmgtfy.com/?${queryString}>`
    };
  }

  handleAutocomplete (args) {
    if (!this.settings.get('autocompletes', true) || args.length === 0) {
      return false;
    }

    if (args[1] === void 0) {
      return {
        commands: [ {
          command: 'Please input your search terms...',
          instruction: true
        } ]
      };
    }

    const lastArg = args[args.length - 1];
    const searchEngines = Object.keys(Constants.SEARCH_ENGINES);
    const searchEngine = searchEngines.find(engine => args[args.lastIndexOf(engine)] === engine);
    if (!searchEngine) {
      return {
        commands: searchEngines
          .filter(engine => engine.includes(lastArg))
          .map(engine => ({ command: engine })),
        header: 'select a search engine...'
      };
    }

    const searchTypes = Object.keys(Constants.SEARCH_TYPES);
    const searchType = searchTypes.find(type => args[args.indexOf(searchEngine) + 1] === type);
    if (searchEngine === 'google' && !searchType) {
      return {
        commands: searchTypes
          .filter(type => type.includes(lastArg))
          .map(type => ({ command: type })),
        header: 'select a search type...'
      };
    }
  }
};
