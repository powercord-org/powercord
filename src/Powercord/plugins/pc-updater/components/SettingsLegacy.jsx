const { React } = require('powercord/webpack');
const { Button } = require('powercord/components');
const { TextInput, SwitchItem } = require('powercord/components/settings');

module.exports = class UpdaterSettings extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
  }

  render () {
    const { getSetting, toggleSetting, updateSetting } = this.props;

    return <div>
      <SwitchItem
        note='Whether Powercord should check for updates.'
        value={getSetting('checkForUpdates', true)}
        onChange={() => toggleSetting('checkForUpdates')}
      >
        Check for Updates
        <Button disabled={this.plugin.checking} onClick={() => {
          this.forceUpdate();
          this.plugin.checkForUpdateLegacy(this.forceUpdate.bind(this), true);
        }}>{this.plugin.checking ? 'Checking...' : 'Check now'}</Button>
      </SwitchItem>

      <TextInput
        note='How frequently Powercord checks for updates (in minutes).'
        defaultValue={getSetting('interval', 15)}
        required={true}
        onChange={val => updateSetting('interval', (Number(val) && Number(val) >= 1) ? Number(val) : 1, 15)}
      >
        Interval
      </TextInput>
    </div>;
  }
};
