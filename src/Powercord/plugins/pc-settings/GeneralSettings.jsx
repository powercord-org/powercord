const { getModuleByDisplayName, React } = require('powercord/webpack');
const { TextInput } = require('powercord/components/settings');
const SwitchItem = getModuleByDisplayName('switchitem');

module.exports = class GeneralSettings extends React.Component {
  render () {
    return <div>
      <TextInput value={powercord.settingsManager.get('prefix', '.')} onChange={e => this.editConfig('prefix', e)}>
        Commands prefix
      </TextInput>
      <SwitchItem
        note='Should Powercord open overlay devtools when it gets injected (useful for developing themes)'
        value={powercord.settingsManager.get('openOverlayDevTools', false)}
        onChange={() => this.editConfig('openOverlayDevTools', !powercord.settingsManager.get('openOverlayDevTools', false))}
      >
        Overlay devtools
      </SwitchItem>
    </div>;
  }

  editConfig (key, value) {
    powercord.settingsManager.set(key, value);
    setTimeout(() => this.forceUpdate(), 0);
  }
};
