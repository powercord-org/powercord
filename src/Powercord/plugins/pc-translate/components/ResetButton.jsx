const { React, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');

const ChannelTextAreaButton = AsyncComponent.from(getModuleByDisplayName('ChannelTextAreaButton'));

module.exports = class ResetButton extends React.PureComponent {
  render () {
    return (
      <ChannelTextAreaButton
        className={this.props.className || 'button-2vd_v_ pc-button'}
        iconName='HappyBubble'
        label='Restore original message'
        onClick={this.props.onClick.bind(this)}
      />
    );
  }
};
