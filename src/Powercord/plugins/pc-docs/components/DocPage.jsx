/* eslint-disable no-case-declarations */
const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Spinner, FormNotice, AsyncComponent } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');
const { get } = require('powercord/http');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));

const documentCache = {};

class DocPage extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      document: documentCache[this.key]
    };
  }

  get key () {
    return `${this.props.category}/${this.props.doc}`;
  }

  async componentDidMount () {
    const baseUrl = powercord.settings.get('backendURL', WEBSITE);
    const document = await get(`${baseUrl}/api/v2/docs/${this.props.category}/${this.props.doc}`).then(res => res.body);
    documentCache[this.key] = document;
    this.setState({ document });
  }

  render () {
    const { modules: { hljs, markup } } = this.props;
    const { document } = this.state;
    if (!document) {
      return <Spinner/>;
    }

    const render = [];
    document.contents.forEach(element => {
      switch (element.type) {
        case 'TITLE':
          render.push(React.createElement(`h${element.depth}`, null, element.content));
          break;
        case 'TEXT':
          render.push(React.createElement('p', null, this._mdToReact(element.content)));
          break;
        case 'LIST':
          render.push(React.createElement(element.ordered ? 'ol' : 'ul', null, element.items.map(item =>
            React.createElement('li', null, this._mdToReact(item))
          )));
          break;
        case 'NOTE':
          render.push(<FormNotice
            type={FormNotice.Types[element.color === 'INFO' ? 'PRIMARY' : element.color]}
            body={this._mdToReact(element.content)}
          />);
          break;
        case 'CODEBLOCK':
          let className,
            Code;
          if (element.lang) {
            className = `hljs ${element.lang}`;
            Code = () => React.createElement('div', {
              dangerouslySetInnerHTML: {
                __html: hljs.highlight(element.lang, element.code).value
              }
            });
          } else {
            className = 'hljs';
            Code = () => React.createElement('div', null, element.code);
          }
          render.push(<pre className={markup}>
            <code className={className}>
              <Code/>
              {element.lang && <div className='powercord-codeblock-lang'>{element.lang}</div>}
              <div className='powercord-lines'/>
              <button className='powercord-codeblock-copy-btn' onClick={this._handleCodeCopy}>copy</button>
            </code>
          </pre>);
          break;
        case 'TABLE':
          render.push(<table cellSpacing='0'>
            <tr>
              {element.thead.map((th, i) =>
                <th key={`th-${i}`}>{this._mdToReact(th)}</th>
              )}
            </tr>
            {element.tbody.map((tr, i) => <tr key={`tr-${i}`}>
              {tr.map((td, i) => <td key={`td-${i}`} style={element.center[i] ? { textAlign: 'center' } : null}>
                {this._mdToReact(td)}
              </td>)}
            </tr>)}
          </table>);
      }
    });

    // render
    return <div className='powercord-text'>
      <FormTitle tag='h2' className='powercord-documentation-title'>{document.name}</FormTitle>
      <div className='powercord-documentation'>{render}</div>
    </div>;
  }

  _mdToReact (md) {
    const react = this.props.modules.markdown.markdownToReact(md, { inline: true });
    return this._transformReact(react[0].props.children);
  }

  _transformReact (react) {
    return react.map(c => {
      if (c.type === 'a') {
        if (c.props.href.startsWith('#')) {
          const { href } = c.props;
          c.props.onClick = () => this.props.setSection(href.substr(1));
          c.props.href = '#';
        } else {
          c.props.target = '_blank';
        }
      } else if (c.props && Array.isArray(c.props.children)) {
        c.props.children = this._transformReact(c.props.children);
      }
      return c;
    });
  }

  _handleCodeCopy (e) {
    powercord.pluginManager.get('pc-codeblocks')._onClickHandler(e);
  }
}

let modules;
module.exports = (props) => <AsyncComponent
  _provider={async () => {
    if (!modules) {
      modules = {
        hljs: await getModule([ 'highlight' ]),
        markdown: await getModule([ 'markdownToHtml' ]),
        markup: (await getModule([ 'markup' ])).markup
      };
    }
    return () => <DocPage modules={modules} {...props}/>;
  }}
/>;
