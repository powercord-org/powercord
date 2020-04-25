const { React } = require('powercord/webpack');
const { Clickable } = require('powercord/components');

class SnippetButton extends React.Component {
  render () {
    const applied = this.props.main._quickCSS.includes(`Snippet ID: ${this.props.message.id}`);
    return (
      <div className={[ 'powercord-snippet-apply', applied && 'applied' ].filter(Boolean).join(' ')}>
        <Clickable onClick={() => {
          this.props.main._applySnippet(this.props.message).then(() => this.forceUpdate()); // yes ik its ew
        }}>
          {applied ? 'Snippet Applied' : 'Apply Snippet'}
        </Clickable>
      </div>
    );
  }
}

module.exports = SnippetButton;
