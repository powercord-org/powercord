const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = ({ getSetting, toggleSetting, patch }) => (
  <div>
    <SwitchItem
      note='Adds shuffle, repeat and other controls to the Spotify modal. Increases the height if enabled, if not these controls are available in the context menu.'
      value={getSetting('showControls', true)}
      onChange={() => toggleSetting('showControls')}
    >
      Show advanced controls
    </SwitchItem>

    <SwitchItem
      note={'Prevents Discord from automatically pausing Spotify playback if you\'re sending voice for more than 30 seconds.'}
      value={getSetting('noAutoPause', true)}
      onChange={() => {
        patch(getSetting('noAutoPause', true));
        toggleSetting('noAutoPause');
      }}
    >
      No auto pause
    </SwitchItem>

    <SwitchItem
      note={'Adds icons next to first glace buttons and replaces hints found under the \'Devices\' sub-menu with corresponding icons based on the device(s) in-use.'}
      value={getSetting('showContextIcons', false)}
      onChange={() => toggleSetting('showContextIcons')}
    >
      Show context menu icons
    </SwitchItem>
  </div>
);
