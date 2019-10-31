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
          const html = this._mdToHtml(element.content);
          render.push(React.createElement('p', {
            dangerouslySetInnerHTML: {
              __html: html.slice(23, html.length - 6)
            }
          }));
          break;
        case 'NOTE':
          render.push(<FormNotice
            type={FormNotice.Types[element.color === 'INFO' ? 'PRIMARY' : element.color]}
            body={<div dangerouslySetInnerHTML={{ __html: this._mdToHtml(element.content) }}/>}
          />);
          break;
        case 'CODEBLOCK':
          const Hljs = () => React.createElement('div', {
            dangerouslySetInnerHTML: {
              __html: hljs.highlight(element.lang, element.code).value
            }
          });
          render.push(<pre className={markup}>
            <code className={`hljs ${element.lang}`}>
              <Hljs/>
              <div className="powercord-codeblock-lang">{element.lang}</div>
              <div className="powercord-lines"/>
              <button className="powercord-codeblock-copy-btn" onClick={this._handleCodeCopy}>copy</button>
            </code>
          </pre>);
          break;
      }
    });

    // render
    return <div className='powercord-text'>
      <FormTitle tag='h2'>{document.name}</FormTitle>
      <div className='powercord-documentation'>{render}</div>
    </div>;
  }

  _mdToHtml (md) {
    const html = this.props.modules.markdown.markdownToHtml(md);
    return html.replace('<a ', '<a target="_blank" ');
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
