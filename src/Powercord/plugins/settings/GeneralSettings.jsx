const { getModuleByDisplayName, React } = require('powercord/webpack');
const { TextInput } = require('powercord/settings');
const SwitchItem = getModuleByDisplayName('switchitem');

module.exports = class GeneralSettings extends React.Component {
  render () {
    return <div>
      <TextInput value={powercord.config.prefix} onChange={e => this.editConfig('prefix', e)}>
        Commands prefix
      </TextInput>
      <SwitchItem
        note='Should Powercord open overlay devtools when it gets injected (useful for developing themes)'
        value={powercord.config.openOverlayDevTools}
        onChange={() => this.editConfig('openOverlayDevTools', !powercord.config.openOverlayDevTools)}
      >
        Overlay devtools
      </SwitchItem>
    </div>;
  }

  editConfig(key, value) {
    powercord.editConfig(key, value);
    setTimeout(() => this.forceUpdate(), 0);
  }
};
