const Plugin = require('ac/Plugin');
const { createElement } = require('ac/util');
const { clipboard } = require('electron');

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
    if (codeblock.querySelector('.aethcord-codeblock-copy-btn')) {
      return;
    }

    // Attribution: noodlebox
    // eslint-disable-next-line prefer-template
    codeblock.innerHTML = '<ol>' + codeblock.innerHTML
      .split('\n')
      .map(l => `<li>${l}</li>`)
      .join('') + '</ol>';

    codeblock.appendChild(
      createElement('button', {
        className: 'aethcord-codeblock-copy-btn',
        innerHTML: 'copy',
        onclick: () => {
          const range = document.createRange();
          range.selectNode(codeblock.children[0]);

          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);

          clipboard.writeText(selection.toString());

          selection.removeAllRanges();
        }
      })
    );
  }
};
