const { React } = require('powercord/webpack');
const { Confirm } = require('powercord/components/modal');
const {
  Text
} = require('powercord/components');
const { close: closeModal } = require('powercord/modal');

let setting;

module.exports = class Modal extends React.Component {
  render () {
    if (this.options && this.options.setting) {
      ({ setting } = this.options);

      if (!setting.default) {
        setting.default = '';
      }
    }

    return <Confirm
      red={this.props.red || false}
      header={this.props.header || null}
      confirmText={this.props.confirmText || 'Confirm'}
      cancelText={this.props.cancelText || 'Cancel'}
      onConfirm={() => this.props.onConfirm()}
      onCancel={() => typeof this.props.onCancel !== 'undefined' ? this.props.onCancel() : closeModal()}
    >
      <Text>{this.props.desc}</Text>
    </Confirm>;
  }
};
