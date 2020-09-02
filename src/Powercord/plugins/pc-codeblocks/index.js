const { Plugin } = require('powercord/entities');
const { React, getModule, hljs, i18n: { Messages } } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { getReactInstance, findInReactTree } = require('powercord/util');
const { clipboard } = require('electron');

module.exports = class Codeblocks extends Plugin {
  startPlugin () {
    this.loadStylesheet('style.css');
    this.patchCodeblocks();
  }

  pluginWillUnload () {
    uninject('pc-codeblocks-inline');
    uninject('pc-codeblocks-embed');
    this._forceUpdate();
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

    this._forceUpdate();
  }

  injectCodeblock (args, codeblock) {
    const { render } = codeblock.props;

    codeblock.props.render = (codeblock) => {
      const res = render(codeblock);

      const { children } = res.props;
      const lang = args ? args[0].lang : children.props.className.split(' ').find(className => !className.includes('-') && className !== 'hljs');
      const isHljs = !!children.props.dangerouslySetInnerHTML;
      const lines = children.props.dangerouslySetInnerHTML
        ? children.props.dangerouslySetInnerHTML.__html
          // Ensure there is no span on multiple lines
          .replace(/<span class="(hljs-[a-z]+)">([^<]*)\n/g, '<span class="$1">$2</span>\n<span class="$1">')
          .split('\n')
        : children.props.children.split('\n');

      delete children.props.dangerouslySetInnerHTML;
      children.props.children = this.renderCodeblock(lang, lines, isHljs);
      return res;
    };
  }

  renderCodeblock (lang, lines, isHljs) {
    const language = hljs.getLanguage(lang);

    return React.createElement(React.Fragment, null,
      language && React.createElement('div', { className: 'powercord-codeblock-lang' }, language.name),
      React.createElement('table', { className: 'powercord-codeblock-table' },
        ...lines.map((line, i) => React.createElement('tr', null,
          React.createElement('td', null, i + 1),
          React.createElement('td', isHljs ? { dangerouslySetInnerHTML: { __html: line } } : { children: line })
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
    }, 1000);

    const code = [ ...target.parentElement.querySelectorAll('td:last-child') ].map(t => t.textContent).join('\n');
    clipboard.writeText(code);
  }

  _forceUpdate () {
    document.querySelectorAll('[id^="chat-messages-"]').forEach(e => getReactInstance(e).memoizedProps.onMouseMove());
  }
};
