const Plugin = require('@ac/plugin');
const { createElement } = require('@ac/util');

module.exports = class Codeblocks extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'StateWatcher' ]
    });
  }

  start () {
    aethcord
      .plugins
      .get('StateWatcher')
      .on('codeblock', this.inject);
  }

  inject (codeblock) {
    codeblock.appendChild(
      createElement('button', {
        className: 'aethcord-codeblock-copy-btn',
        innerHTML: 'copy',
        onclick: function () {
            const range = document.createRange();
            range.selectNode(codeblock.children[0]);
            console.log(range.toString());
        }
      })
    );

    // Attribution: noodlebox
    codeblock.innerHTML = '<ol>' + codeblock.innerHTML
      .split('\n')
      .map(l => `<li>${l}</li>`)
      .join('') + '</ol>';
  }
};
