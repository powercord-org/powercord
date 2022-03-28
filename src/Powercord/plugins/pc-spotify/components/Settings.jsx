const { React, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem, RadioGroup } = require('powercord/components/settings');

module.exports = React.memo(
  ({ getSetting, toggleSetting, updateSetting, patch }) => (
    <div>
      <SwitchItem
        note={Messages.SPOTIFY_SETTINGS_SQUARE_COVERS_DESCRIPTION}
        value={getSetting('squareCovers', false)}
        onChange={() => toggleSetting('squareCovers')}
      >
        {Messages.SPOTIFY_SETTINGS_SQUARE_COVERS}
      </SwitchItem>

      <SwitchItem
        note={Messages.SPOTIFY_SETTINGS_NO_AUTO_PAUSE_DESCRIPTION}
        value={getSetting('noAutoPause', true)}
        onChange={() => {
          patch(getSetting('noAutoPause', true));
          toggleSetting('noAutoPause');
        }}
      >
        {Messages.SPOTIFY_SETTINGS_NO_AUTO_PAUSE}
      </SwitchItem>

      <RadioGroup
        onChange={e => updateSetting("showControls", e.value)}
        value={getSetting("showControls", "hover")}
        options={[
          {
            name: `${Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS_HOVER}`,
            desc: `${Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS_HOVER_DESCRIPTION}`,
            value: "hover"
          },
          {
            name: `${Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS_ALWAYS}`,
            desc: `${Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS_ALWAYS_DESCRIPTION}`,
            value: "always"
          },
          {
            name: `${Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS_OFF}`,
            desc: `${Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS_OFF_DESCRIPTION}`,
            value: "off"
          }
        ]}
        >
        {Messages.SPOTIFY_SETTINGS_SHOW_CONTROLS}
      </RadioGroup>
    </div>
  )
);
