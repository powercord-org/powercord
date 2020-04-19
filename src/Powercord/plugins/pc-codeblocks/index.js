const { Plugin } = require('powercord/entities');
const { React, getModule, hljs } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { findInReactTree } = require('powercord/util');
const { clipboard } = require('electron');
const { resolve } = require('path');

module.exports = class Codeblocks extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.patchCodeblocks();
  }

  pluginWillUnload () {
    uninject('pc-codeblocks-inline');
    uninject('pc-codeblocks-embed');
  }

  async patchCodeblocks () {
    const parser = await getModule([ 'parse', 'parseTopic' ]);
    inject('pc-codeblocks-inline', parser.defaultRules.codeBlock, 'react', (args, res) => {
      this.injectCodeblock(args, res);

      return res;
    });

    inject('pc-codeblocks-embed', parser, 'parseAllowLinks', (_, res) => {
      for (const children of res) {
        const codeblock = findInReactTree(children, n => n.type && n.type.name === '');
        if (codeblock) {
          this.injectCodeblock(null, codeblock);
        }
      }

      return res;
    });
  }

  injectCodeblock (args, codeblock) {
    const { render } = codeblock.props;

    codeblock.props.render = (codeblock) => {
      const res = render(codeblock);

      const { children } = res.props;
      const lang = args ? args[0].lang : children.props.className.split(' ').find(className => !className.includes('-') && className !== 'hljs');

      if (children.props.dangerouslySetInnerHTML) {
        children.props.children = this.renderCodeblock(lang, children.props.dangerouslySetInnerHTML);

        delete children.props.dangerouslySetInnerHTML;
      } else if (typeof children.props.children === 'string') {
        children.props.children = this.renderCodeblock(lang, children.props.children);
      }

      return res;
    };
  }

  renderCodeblock (lang, content) {
    const children = [];
    const isDangerouslySetInnerHTML = typeof content === 'object';
    const isValidLanguage = typeof hljs.getLanguage(lang) !== 'undefined';

    children.push(React.createElement('div', {
      dangerouslySetInnerHTML: isDangerouslySetInnerHTML ? content : null
    }, isDangerouslySetInnerHTML ? null : content), isValidLanguage && React.createElement('div', {
      className: 'powercord-codeblock-lang'
    }, lang), React.createElement('div', {
      className: 'powercord-lines'
    }), React.createElement('button', {
      className: 'powercord-codeblock-copy-btn',
      onClick: this._onClickHandler
    }, 'copy'));

    return children;
  }

  _onClickHandler (e) {
    const { target } = e;

    if (target.classList.contains('copied')) {
      return;
    }

    target.innerText = 'copied!';
    target.classList.add('copied');

    setTimeout(() => {
      target.innerText = 'copy';
      target.classList.remove('copied');
    }, 1000);

    const codeContent = target.parentElement.children[0];
    const pcCopy = codeContent.querySelector('[data-powercord-codeblock-copy]');
    if (pcCopy) {
      return clipboard.writeText(pcCopy.textContent);
    }

    const range = document.createRange();
    range.selectNode(codeContent);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    clipboard.writeText(selection.toString());

    selection.removeAllRanges();
  }
};
