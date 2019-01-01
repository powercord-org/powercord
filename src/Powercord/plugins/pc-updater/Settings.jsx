const { React } = require('powercord/webpack');
const { TextInput, SwitchItem } = require('powercord/components/settings');

module.exports = class GeneralSettings extends React.Component {
  constructor (props) {
    super();

    this.settings = props.settings;
    this.state = {
      checkForUpdates: props.settings.get('checkForUpdates', true),
      interval: props.settings.get('interval', 15)
    };
  }

  render () {
    const settings = this.state;

    const set = (key, value = !settings[key], defaultValue) => {
      if (!value && defaultValue) {
        value = defaultValue;
      }

      this.settings.set(key, value);
      this.setState({
        [key]: value
      });
    };

    return (
      <div>
        <SwitchItem
          note='Whether Powercord should check for updates.'
          value={settings.checkForUpdates}
          onChange={() => set('checkForUpdates')}
        >
          Check for Updates
        </SwitchItem>

        <TextInput
          note='How frequently Powercord checks for updates (in minutes).'
          defaultValue={settings.interval}
          required={true}
          onChange={val => set('interval', (Number(val) && Number(val) >= 1) ? Number(val) : 1, 15)}
        >
          Interval
        </TextInput>
      </div>
    );
  }
};
