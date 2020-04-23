const { React } = require('powercord/webpack');
const CodeMirror = require('codemirror');
require('codemirror/mode/css/css');
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
    this.cmRef = React.createRef();
  }

  render () {
    return (<div ref={this.cmRef}/>);
  }

  shouldComponentUpdate () {
    return false;
  }

  componentDidMount () {
    const editor = new CodeMirror(this.cmRef.current, {
      theme: 'porkord',
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      foldGutter: true,
      gutters: [ 'CodeMirror-linenumbers', 'CodeMirror-foldgutter' ],
      extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });
    this.props.onReady(editor);
  }
}

module.exports = CodeMirrorComponent;
