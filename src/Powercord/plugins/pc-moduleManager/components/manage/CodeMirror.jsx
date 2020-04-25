const { React } = require('powercord/webpack');
const CodeMirror = require('codemirror');
require('codemirror/mode/css/css');
require('codemirror/addon/search/searchcursor');
require('codemirror/addon/search/search');
require('codemirror/addon/search/jump-to-line');
require('codemirror/addon/edit/matchbrackets');
require('codemirror/addon/edit/closebrackets');
require('codemirror/addon/fold/foldcode');
require('codemirror/addon/fold/foldgutter');
require('codemirror/addon/fold/brace-fold');
require('codemirror/addon/fold/comment-fold');
require('codemirror/addon/hint/show-hint');
require('codemirror/addon/hint/css-hint');
require('codemirror/addon/lint/lint');
require('codemirror/addon/lint/css-lint');
require('codemirror/addon/selection/active-line');

class CodeMirrorComponent extends React.PureComponent {
  constructor () {
    super();
    this.state = { cm: null };
    this.cmRef = React.createRef();
  }

  render () {
    return (
      <div
        className='powercord-quickcss-codemirror'
        ref={this.cmRef}
        onKeyDown={e => {
          if (e.ctrlKey) {
            if (e.keyCode === 82) { // Ctrl+R reloads the client. fun.
              e.preventDefault();
              this.state.cm.execCommand('replace');
            } else if (this.props.popout && e.keyCode === 70) { // Ctrl+F doesn't work in popout for some odd reason
              this.state.cm.execCommand('find');
            }
          }
          e.stopPropagation();
        }}
      />
    );
  }

  componentDidMount () {
    const cm = new CodeMirror(this.cmRef.current, {
      theme: 'porkord',
      styleActiveLine: true,
      lineNumbers: this.props.getSetting('cm-lineNumbers', true),
      foldGutter: this.props.getSetting('cm-codeFolding', true),
      matchBrackets: this.props.getSetting('cm-matchBrackets', true),
      autoCloseBrackets: this.props.getSetting('cm-closeBrackets', true),
      lineWrapping: this.props.getSetting('cm-wrap', false),
      indentWithTabs: this.props.getSetting('cm-tabs', false),
      tabSize: this.props.getSetting('cm-indentSize', 2),
      indentUnit: this.props.getSetting('cm-indentSize', 2),
      gutters: [ 'CodeMirror-linenumbers', 'CodeMirror-foldgutter' ],
      extraKeys: {
        'Ctrl-Space': 'autocomplete',
        'Shift-Ctrl-=': (cm) => this.props.getSetting('cm-codeFolding', true) && cm.execCommand('unfoldAll'),
        'Shift-Ctrl--': (cm) => this.props.getSetting('cm-codeFolding', true) && cm.execCommand('foldAll')
      }
    });
    this.props.onReady(cm);
    this.setState({ cm });
  }

  shouldComponentUpdate () {
    return false;
  }
}

module.exports = CodeMirrorComponent;
