const { Plugin } = require('powercord/entities');

const Constants = {
  SEARCH_ENGINES: {
    google: 'g',
    yahoo: 'y',
    bing: 'b',
    ask: 'k',
    aol: 'a',
    duckduckgo: 'd'
  },
  SEARCH_TYPES: {
    web: 'w',
    images: 'i',
    videos: 'v',
    news: 'n',
    shopping: 's'
  }
};

module.exports = class LMGTFY extends Plugin {
  startPlugin () {
    this.registerCommand(
      'lmgtfy',
      [],
      'Let me google that for you...',
      '{c} [ ...search terms ] < search engine > < search type >',
      (args) => {
        if (args.length < 1) {
          return;
        }

        const options = args.slice(-2).map(arg => arg.toLowerCase());
        const params = {};
        params.searchEngine = Constants.SEARCH_ENGINES.google;

        for (const key of Object.keys(Constants)) {
          if (key === 'SEARCH_ENGINES') {
            for (const searchEngine of Object.keys(Constants[key])) {
              const match = options[Constants.SEARCH_ENGINES[options[0]] === searchEngine ? 0 : 1].toLowerCase() === searchEngine;
              if (match) {
                params.searchEngine = Constants.SEARCH_ENGINES[searchEngine];
                args.splice(args.indexOf(searchEngine), 1);
              }
            }
          } else if (key === 'SEARCH_TYPES') {
            for (const searchType of Object.keys(Constants[key])) {
              const match = options[Constants.SEARCH_TYPES[options[0]] === searchType ? 0 : 1].toLowerCase() === searchType;
              if (match) {
                if (params.searchEngine === 'g') {
                  params.searchType = Constants.SEARCH_TYPES[searchType];
                  args.length = Constants.SEARCH_ENGINES[options[0]] ? args.indexOf(searchType) - 1 : args.indexOf(searchType);
                }
              }
            }
          }
        }

        const { searchEngine: s, searchType: t } = params;
        const searchParams = `${s !== 'g' && !t ? `&s=${s}` : t ? `&s=${s}&t=${t}` : ''}`;
        const queryString = `?q=${encodeURI(`${args.join('+')}${searchParams}`)}`;

        return {
          send: true,
          result: `<https://lmgtfy.com/${queryString}>`
        };
      }
    );
  }
};
