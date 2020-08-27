const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = React.memo(
  ({ getSetting, toggleSetting, patch }) => (
    <div>
      <SwitchItem
        note='Shows covers in a square shape instead of a rounded one.'
        value={getSetting('squareCovers', false)}
        onChange={() => toggleSetting('squareCovers')}
      >
        Squared covers
      </SwitchItem>

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
    </div>
  )
);
