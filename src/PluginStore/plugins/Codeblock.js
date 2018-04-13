const { join } = require('path');
const Plugin = require(join(__dirname, '..', '..', 'Structures', 'Plugin'));

module.exports = class Codeblock extends Plugin {
  constructor (main) {
    super(main, 'Codeblock');
  }

  async inject (codeblock) {
    codeblock.innerHTML = '<ol>' + codeblock.innerHTML
      .split('\n')
      .map(l => `<li>${l}</li>`)
      .join('') + '</ol>';

    codeblock.appendChild(
      this.createElement('button', {
        className: 'aethcord-copycode-btn',
        innerHTML: 'copy',
        onclick: function () {
          this.classList.add('success');
          setTimeout(() => this.classList.remove('success'), 1000);

          const range = document.createRange();
          range.selectNode(codeblock.children[0]);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          document.execCommand('copy');
          selection.removeAllRanges();
        }
      })
    );
  }

  async load () {
    this.main.StateWatcher.on('codeblock', this.inject.bind(this));
  }

  async unload () {
    this.main.StateWatcher.removeListener('codeblock', this.inject.bind(this));
  }
};
