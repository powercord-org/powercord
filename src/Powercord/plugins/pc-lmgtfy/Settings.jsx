const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = ({ getSetting, toggleSetting }) => (
  <div>
    <SwitchItem
      note='Whether the LMGTFY command should enable "Internet Explainer" by default or not.'
      value={getSetting('iie', false)}
      onChange={() => toggleSetting('iie')}
    >
      Enable Internet Explainer
    </SwitchItem>
    <SwitchItem
      note='Whether the LMGTFY command should display autocompletes by default or not.'
      value={getSetting('autocompletes', true)}
      onChange={() => toggleSetting('autocompletes')}
    >
      Display Autocompletes
    </SwitchItem>
  </div>
);
