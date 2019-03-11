const { React } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const { TextInput } = require('powercord/components/settings');

module.exports = class NewFolderModal extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = {
      name: props.name || '',
      icon: props.icon || ''
    };
  }

  render () {
    return <Confirm
      red={false}
      header={this.props.edit ? 'Edit a folder' : 'Create a new folder'}
      confirmText={this.props.edit ? 'Save changes' : 'Create'}
      cancelText='Cancel'
      onConfirm={() => this.props.onConfirm(this.state.name, this.state.icon)}
      onCancel={() => this.props.onCancel()}
    >
      <div className='powercord-folder-modal'>
        <TextInput
          required
          defaultValue={this.state.name}
          onChange={name => this.setState({ name })}
        >
          Folder name
        </TextInput>
        <TextInput
          defaultValue={this.state.icon}
          onChange={icon => this.setState({ icon })}
        >
          Folder icon URL
        </TextInput>
      </div>
    </Confirm>;
  }
};
