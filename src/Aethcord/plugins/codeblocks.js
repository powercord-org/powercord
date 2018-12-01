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
    if (codeblock.querySelector('.aethcord-codeblock-copy-btn') || codeblock.closest('.search-result-message')) {
      return;
    }

    // Attribution: noodlebox
    // eslint-disable-next-line prefer-template
    codeblock.innerHTML = '<ol>' + codeblock.innerHTML
      .split('\n')
      .map(l => `<li>${l}</li>`)
      .join('') + '</ol>';

    const lang = codeblock.className.split(' ').filter(c => !c.includes('-') && c !== 'hljs');
    if (lang.length !== 0) {
      codeblock.appendChild(
        createElement('div', {
          className: 'aethcord-codeblock-lang',
          innerHTML: lang[0]
        })
      );
    }

    codeblock.appendChild(
      createElement('button', {
        className: 'aethcord-codeblock-copy-btn',
        innerHTML: 'copy',
        onclick: (e) => {
          if (e.target.classList.contains('copied')) {
            return;
          }

          e.target.innerText = 'copied!';
          e.target.classList.add('copied');
          setTimeout(() => {
            e.target.innerText = 'copy';
            e.target.classList.remove('copied');
          }, 1000);
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
