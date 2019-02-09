const Plugin = require('powercord/Plugin');
const { createElement } = require('powercord/util');
const { clipboard } = require('electron');
const { resolve } = require('path');

module.exports = class Codeblocks extends Plugin {
  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));

    powercord
      .pluginManager
      .get('pc-stateWatcher')
      .on('codeblock', this.inject);

    document.querySelectorAll('.hljs').forEach(this.inject.bind(this));
  }

  unload () {
    this.unloadCSS();

    powercord
      .pluginManager
      .get('pc-stateWatcher')
      .off('codeblock', this.inject);

    Array.from(document.querySelectorAll('.powercord-codeblock-copy-btn')).map(c => c.parentNode).forEach(c => {
      c.innerHTML = c._originalInnerHTML;
    });
  }

  inject (codeblock) {
    if (
      codeblock.querySelector('.powercord-codeblock-copy-btn') ||
      codeblock.closest('.search-result-message')
    ) {
      return;
    }

    codeblock._originalInnerHTML = codeblock.innerHTML;

    const lang = codeblock.className.split(' ').find(c => !c.includes('-') && c !== 'hljs');
    if (lang) {
      codeblock.appendChild(
        createElement('div', {
          className: 'powercord-codeblock-lang',
          innerHTML: lang
        })
      );
    }

    codeblock.innerHTML = `<div>${codeblock.innerHTML}</div>`;
    codeblock.appendChild(createElement('div', { className: 'powercord-lines' }));
    codeblock.appendChild(
      createElement('button', {
        className: 'powercord-codeblock-copy-btn',
        innerHTML: 'copy',
        onclick: ({ target }) => {
          if (target.classList.contains('copied')) {
            return;
          }

          target.innerText = 'copied!';
          target.classList.add('copied');
          setTimeout(() => {
            target.innerText = 'copy';
            target.classList.remove('copied');
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
