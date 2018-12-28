const { getModuleByDisplayName, React } = require('powercord/webpack');
const { TextInput } = require('powercord/components/settings');
const SwitchItem = getModuleByDisplayName('switchitem');

let advanced = false;

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
      <SwitchItem
        note={
          <span><b>DO NOT</b> open this if you're not experienced and if you don't know what you're doing. <b>Seriously.</b></span>
        }
        value={advanced} onChange={() => this.setAdvanced(!advanced)}
      >
        Advanced Settings
      </SwitchItem>
      {advanced && <div>
        <TextInput value={powercord.settingsManager.get('backendUrl', 'https://powercord.xyz')} onChange={e => this.editConfig('backendUrl', e)}>
          Backend URL
        </TextInput>
        <SwitchItem
          note={
            <span><b style={{ color: 'rgb(240, 71, 71)' }}>WARNING:</b> enabling this can be <b>detected by Discord</b> and may result in an <b style={{ color: 'rgb(240, 71, 71)' }}>account termination</b>.
              Powercord is <b>not</b> responsible of what you're doing with this feature. Leave it disabled if unsure</span>
          }
          value={powercord.settingsManager.get('experiments', false)}
          onChange={() => this.editConfig('experiments', !powercord.settingsManager.get('experiments', false))}
        >
          Enable Discord Experiments
        </SwitchItem>
      </div>}
    </div>;
  }

  componentWillUnmount () {
    advanced = false;
  }

  setAdvanced (a) {
    advanced = a;
    this.forceUpdate();
  }

  editConfig (key, value) {
    powercord.settingsManager.set(key, value);
    setTimeout(() => this.forceUpdate(), 0);
  }
};
