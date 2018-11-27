const { React, contextMenu } = require('ac/webpack');

module.exports = class ButtonItem extends React.Component {
  onClick () {
    contextMenu.closeContextMenu();
    this.props.item.onClick();
  }

  render () {
    return (
      <div class='item-1Yvehc' role='button' onClick={this.onClick.bind(this)}>
        <span>{this.props.item.name}</span>
        <div class='hint-22uc-R'>{this.props.item.hint}</div>
      </div>
    );
  }
}