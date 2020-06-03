const { Plugin } = require('powercord/entities');
const { React, getAllModules } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron');

module.exports = class Codeblocks extends Plugin {
  constructor () {
    super();

    this.commentRegEx = new RegExp(/<span class="hljs-comment">(.|\n)*?<\/span>/, 'g');
  }

  async startPlugin () {
    this.loadStylesheet('style.scss');
    this.patchCodeblocks();
  }

  pluginWillUnload () {
    uninject('pc-codeblocks-styling');
  }

  async patchCodeblocks () {
    const LazyWebpackLoader = (await getAllModules([ 'LazyLibrary' ]))[1];
    inject('pc-codeblocks-styling', LazyWebpackLoader, 'LazyLibrary', (args, res) => {
      if (res.type === 'pre') {
        this.injectCodeblock(args, res);
      }

      return res;
    });
  }

  injectCodeblock (args) {
    const { render } = args[0];
    args[0].render = (hljs) => {
      const res = render(hljs);

      const { children } = res.props;
      const lang = children.props.className.split(' ').find(className => !className.includes('-') && className !== 'hljs');

      if (children.props.dangerouslySetInnerHTML) {
        children.props.children = this.renderCodeblock(lang, children.props.dangerouslySetInnerHTML.__html);

        delete children.props.dangerouslySetInnerHTML;
      } else if (typeof children.props.children === 'string') {
        children.props.children = this.renderCodeblock(lang, children.props.children, true);
      }

      return res;
    };
  }

  renderCodeblock (lang, content, fallback = false) {
    const getProps = (content) => fallback ? ({ children: content }) : ({ dangerouslySetInnerHTML: { __html: content } });

    let lineNumber = 0;
    const tableContent = content.split(/\r?\n/).map(content =>
      React.createElement('tr', {}, React.createElement('td', {
        className: 'powercord-codeblock-ln-line',
        'data-line-number': ++lineNumber
      }), React.createElement('td', {
        className: 'powercord-codeblock-ln-code',
        ...getProps(content)
      }))
    );

    const children = [];

    children.push(lang && React.createElement('div', {
      className: 'powercord-codeblock-lang'
    }, lang), React.createElement('table', {
      className: 'powercord-codeblock-ln'
    }, tableContent), React.createElement('button', {
      className: 'powercord-codeblock-copy-btn',
      onClick: this._onClickHandler.bind(this)
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

    const codeContent = target.previousSibling;
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
