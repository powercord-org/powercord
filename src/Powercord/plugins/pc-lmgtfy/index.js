const { Plugin } = require('powercord/entities');


const types = [ 'web', 'image' ];
const sites = [ 'google', 'yahoo', 'bing', 'ask', 'aol', 'duckduckgo' ];
const siteJson = {
  google: 'g',
  yahoo:'y',
  bing: 'b',
  ask: 'k',
  aol: 'a',
  duckduckgo: 'd'
};
const typeJson = {
  web: 'w',
  image: 'i'
};
module.exports = class LMGTFY extends Plugin {
  startPlugin () {
    this.registerCommand(
      'lmgtfy',
      [],
      'Let me google that for you...',
      '{c} [ ...search terms ] [site] [web|image]',
      (args) => {
        // set default to google and web search
        let t = 'w';
        let s = 'g';
        // no arguments given
        if (args.length < 1) {
          return {
            send: false,
            result: 'No Query specified,you need to specify a query.\n Like this for example: `.lmgtfy A search term google web`'
          };
        }
        const options = args.slice(-2);
        // Loop through both the arrays to check the options specified
        sites.forEach(e => {
          if (options[0].toLowerCase() === e) {
            s = siteJson[e];
          }
        });

        // lmgtfy only supports image for google searches
        if (s === 'g') {
          types.forEach(e => {
            if (options[1].toLowerCase() === e) {
              t = typeJson[e];
            }
          });
        }
        return {
          send: true,
          result: `<https://lmgtfy.com/?q=${encodeURI(args.slice(0, args.length - 2).join('+'))}&s=${s}&t=${t}>`
        };
      }
    );
  }
};
