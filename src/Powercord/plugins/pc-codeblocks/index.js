const { Plugin } = require('powercord/entities');
const { waitFor, getOwnerInstance, createElement } = require('powercord/util');
const { getModule } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron');
const { resolve } = require('path');

module.exports = class Codeblocks extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.injectMessage();

    for (const codeblock of document.querySelectorAll('.hljs')) {
      this.inject(codeblock);
    }
  }

  pluginWillUnload () {
    uninject('pc-message-codeblock');

    for (const codeblock of document.querySelectorAll('.powercord-codeblock-copy-btn')) {
      codeblock.parentNode.innerHTML = codeblock.parentNode._originalInnerHTML;
    }
  }

  async injectMessage () {
    const _this = this;

    const messageClasses = await getModule([ 'messageCompact', 'messageCozy' ]);
    const messageQuery = `.${messageClasses.message.replace(/ /g, '.')}`;

    const instance = getOwnerInstance(await waitFor(messageQuery));
    inject('pc-message-codeblock', instance.__proto__, 'render', function (_, res) {
      if (!res.props.children[1]) {
        return res;
      }

      const { message } = res.props.children[1]
        ? (res.props.children[0] !== false
          ? res
            .props.children[1]
            .props.children[0]
          : res
            .props.children[1])
          .props
        : null;

      let hasCodeblock;

      try {
        if (message.contentParsed.find(el => el.type === 'pre') ||
          message.embeds[0].description.find(el => el.type === 'pre')
        ) {
          hasCodeblock = true;
        }
      } catch (_) {
        hasCodeblock = false;
      }

      setImmediate(() => {
        if (
          hasCodeblock &&
          this.ref instanceof Element
        ) {
          /**
           * @todo figure out how to actually inject modifications directly with react internals
           * codeblocks seem to have their content initially passed with dangerouslySetInnerHTML
           * and then re-rendered as a child
           * even then, native injection attempts I made were heavily inconsistent
           * https://haste.aetheryx.xyz/bawazexole.js
           */
          for (const codeblock of this.ref.querySelectorAll('.hljs')) {
            _this.inject(codeblock);
          }
        }
      });

      return res;
    });

    instance.forceUpdate();
  }

  inject (codeblock) {
    if (
      codeblock.querySelector('.powercord-codeblock-copy-btn') ||
      codeblock.closest('.search-result-message')
    ) {
      return;
    }

    codeblock._originalInnerHTML = codeblock.innerHTML;
    codeblock.innerHTML = `<div>${codeblock.innerHTML}</div>`;

    const lang = codeblock.className.split(' ').find(c => !c.includes('-') && c !== 'hljs');
    if (lang) {
      codeblock.appendChild(
        createElement('div', {
          className: 'powercord-codeblock-lang',
          innerHTML: lang
        })
      );
    }

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
