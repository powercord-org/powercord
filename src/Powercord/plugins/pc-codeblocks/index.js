const { Plugin } = require('powercord/entities');
const { React, getModuleByDisplayName } = require('powercord/webpack');
const { inject, uninject } = require('powercord/injector');
const { clipboard } = require('electron');
const { resolve } = require('path');

module.exports = class Codeblocks extends Plugin {
  async startPlugin () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    this.patchMessageContent();
    this.patchEmbed();

    this.codeblockRegExp = new RegExp(/`{3}([\s\S]+?)`{3}/);
  }

  pluginWillUnload () {
    uninject('pc-message-codeblock');
    uninject('pc-embed-codeblock');
  }

  async patchMessageContent () {
    const _this = this;
    const MessageContent = await getModuleByDisplayName('MessageContent');

    inject('pc-message-codeblock', MessageContent.prototype, 'render', function (_, res) {
      const { message, content } = this.props;

      if (_this.codeblockRegExp.test(message.content)) {
        for (const child of content) {
          if (child.props && child.props.className && child.props.className.includes('blockquoteContainer')) {
            const blockquoteChildren = child.props.children[1].props.children;

            for (const child of blockquoteChildren) {
              _this.injectCodeblock(child);
            }
          } else {
            _this.injectCodeblock(child);
          }
        }
      }

      return res;
    });
  }

  async patchEmbed () {
    const _this = this;
    const Embed = await getModuleByDisplayName('Embed');

    inject('pc-embed-codeblock', Embed.prototype, 'renderAll', function (_, res) {
      const { embed } = this.props;

      if (_this.codeblockRegExp.test(embed.rawDescription)) {
        const { children } = res.description.props;

        for (const child of children) {
          _this.injectCodeblock(child);
        }
      } else if (embed.fields && embed.fields.some(field => _this.codeblockRegExp.test(field.rawValue))) {
        const { children } = res.fields.props;

        for (const child of children) {
          if (child[0].props.children && child[0].props.children[1] && child[0].props.children[1].props.children) {
            for (const field of child[0].props.children[1].props.children) {
              _this.injectCodeblock(field);
            }
          }
        }
      }

      return res;
    });
  }

  injectCodeblock (codeblock) {
    const _this = this;

    if (codeblock.props && codeblock.props.renderFallback) {
      const { render } = codeblock.props;

      codeblock.props.render = function (t) {
        const res = render(t);
        const { children } = res.props;

        const lang = children.props.className.split(' ').find(c => !c.includes('-') && c !== 'hljs');

        if (children.props.dangerouslySetInnerHTML) {
          children.props.children = _this.renderCodeblock(lang, children.props.dangerouslySetInnerHTML);

          delete children.props.dangerouslySetInnerHTML;
        } else if (typeof children.props.children === 'string') {
          children.props.children = _this.renderCodeblock(lang, children.props.children);
        }

        return res;
      };
    }
  }

  renderCodeblock (lang, innerHTML) {
    const children = [];
    const isDangerouslySetInnerHTML = typeof innerHTML === 'object';

    children.push(React.createElement('div', {
      dangerouslySetInnerHTML: isDangerouslySetInnerHTML ? innerHTML : null
    }, isDangerouslySetInnerHTML ? null : innerHTML), React.createElement('div', {
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

    const range = document.createRange();
    range.selectNode(target.parentElement.children[0]);

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    clipboard.writeText(selection.toString());

    selection.removeAllRanges();
  }
};
