const { React } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const { TextInput } = require('powercord/components/settings');

module.exports = class Passphrase extends React.Component {
  constructor () {
    super();

    this.state = {
      passphrase: ''
    };
  }

  render () {
    return <Confirm
      red={false}
      header='Update passphrase'
      confirmText='Update'
      cancelText='Cancel'
      onConfirm={() => this.props.onConfirm(this.state.passphrase)}
      onCancel={() => this.props.onCancel()}
    >
      <div className='powercord-passphrase-modal powercord-text'>
        <div className='powercord-passphrase-desc'>
          This passphrase will be used to encrypt your data before sending it to Powercord's servers. It's recommended to
          use it, but you can just leave this empty and your data will be sent unencrypted.
          <div className='space'/>
          If you're already using sync on other machines, put the same passphrase you used.
          <b>Using another passphrase will overwrite old data, so be careful</b>
        </div>
        <TextInput
          type='password'
          defaultValue={this.state.passphrase}
          onChange={passphrase => this.setState({ passphrase })}
        >
          Passphrase
        </TextInput>
      </div>
    </Confirm>;
  }
};
