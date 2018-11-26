const Plugin = require('ac/Plugin');

const libraries = require('./libraries.json');

module.exports = class Libraries extends Plugin {
  constructor () {
    super({ stage: 2 });
  }

  async start () {
    for (const library of libraries) {
      let elem;

      switch (library.type) {
        case 'css':
          elem = document.createElement('link');
          elem.setAttribute('rel', 'stylesheet');
          elem.setAttribute('href', library.url);
          break;

        case 'js':
          elem = document.createElement('script');
          elem.setAttribute('src', library.url);
          break;

        default:
          console.error('Unsupported library type', library.type, 'for library', library.url);
      }

      document.head.appendChild(elem);
    }
  }
};
