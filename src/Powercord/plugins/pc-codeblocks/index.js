const { Plugin } = require('powercord/entities');
const { React, getModule, hljs, i18n: { Messages } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { getReactInstance } = require('powercord/util');
const { clipboard } = require('electron');

module.exports = class Codeblocks extends Plugin {
  startPlugin () {
    this.loadStylesheet('style.css');
    this.patchCodeblocks();
  }

  pluginWillUnload () {
    uninject('pc-codeblocks-format');
    this._forceUpdate();
  }

  async patchCodeblocks () {
    const parser = await getModule([ 'parse', 'parseTopic' ]);
    inject('pc-codeblocks-format', parser.defaultRules.codeBlock, 'react', (args, res) => {
      this.injectCodeblock(args, res);

      return res;
    });

    this._forceUpdate();
  }

  injectCodeblock (args, res) {
    const { render } = res.props;

    res.props.render = (props) => {
      const codeblock = render(props);
      const codeElement = codeblock.props.children;

      const classes = codeElement.props.className.split(' ');

      const lang = args ? args[0].lang : classes[classes.indexOf('hljs') + 1];
      const lines = codeElement.props.dangerouslySetInnerHTML
        ? codeElement.props.dangerouslySetInnerHTML.__html
          // Ensure this no span on multiple lines
          .replace(
            /<span class="(hljs-[a-z]+)">([^<]*)<\/span>/g,
            (_, className, code) => code.split('\n').map(l => `<span class="${className}">${l}</span>`).join('\n')
          )
          .split('\n')
        : codeElement.props.children.split('\n');

      delete codeElement.props.dangerouslySetInnerHTML;

      codeElement.props.children = this.renderCodeblock(lang, lines, Boolean(codeElement.props.dangerouslySetInnerHTML));

      return codeblock;
    };
  }

  renderCodeblock (lang, lines, dangerous) {
    if (hljs && typeof hljs.getLanguage === 'function') {
      lang = hljs.getLanguage(lang);
    }

    return React.createElement(React.Fragment, null,
      lang && React.createElement('div', { className: 'powercord-codeblock-lang' }, lang.name),
      React.createElement('table', { className: 'powercord-codeblock-table' },
        ...lines.map((line, i) => React.createElement('tr', null,
          React.createElement('td', null, i + 1),
          React.createElement('td', lang && dangerous ? { dangerouslySetInnerHTML: { __html: line } } : { children: line })
        ))
      ),
      React.createElement('button', {
        className: 'powercord-codeblock-copy-btn',
        onClick: this._onClickHandler
      }, Messages.COPY)
    );
  }

  _onClickHandler (e) {
    const { target } = e;
    if (target.classList.contains('copied')) {
      return;
    }

    target.innerText = Messages.ACCOUNT_USERNAME_COPY_SUCCESS_1;
    target.classList.add('copied');

    setTimeout(() => {
      target.innerText = Messages.COPY;
      target.classList.remove('copied');
    }, 1e3);

    const code = [ ...target.parentElement.querySelectorAll('td:last-child') ].map(t => t.textContent).join('\n');
    clipboard.writeText(code);
  }

  _forceUpdate () {
    document.querySelectorAll('[id^="chat-messages-"]').forEach(e => getReactInstance(e).memoizedProps.onMouseMove());
  }
};
