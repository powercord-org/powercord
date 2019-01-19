const { React } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const { TextInput } = require('powercord/components/settings');

const { close: closeModal } = require('powercord/modal');

module.exports = class EmojiNameModal extends React.Component {
  constructor () {
    super();

    this.state = {
      emojiName: ''
    };
  }

  render () {
    return (
      <Confirm
        red={false}
        header='Set the emote name'
        confirmText='Continue'
        cancelText='Cancel'
        onConfirm={() => this.props.onConfirm(this.state.emojiName)}
        onCancel={() => closeModal()}
      >
        <div className='powercord-emojiName-modal'>
          <TextInput
            defaultValue={this.state.emojiName}
            onChange={emojiName => this.setState({ emojiName })}
          >
            Emote name
          </TextInput>
        </div>
      </Confirm>
    );
  }
};
