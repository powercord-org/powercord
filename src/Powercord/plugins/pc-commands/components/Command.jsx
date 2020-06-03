const { React, getModuleByDisplayName } = require('powercord/webpack');
const { Text } = require('powercord/components');

const Autocomplete = getModuleByDisplayName('Autocomplete', false);

module.exports = class Command extends Autocomplete.Command {
  renderContent () {
    const res = super.renderContent();
    res.props.children[0] = React.createElement(Text, {
      children: this.props.prefix ? this.props.prefix : powercord.api.commands.prefix,
      style: { color: '#72767d' }
    });

    return res;
  }
};
