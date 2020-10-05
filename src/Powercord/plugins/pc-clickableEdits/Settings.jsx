const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  render () {
    const { getSetting, toggleSetting } = this.props;

    return (
      <div>
        <SwitchItem
          note={[
            'Use the ‘⇧ Shift’ key and primary mouse button to perform cleared message edits, while still ' +
            'being able to double-click to edit messages normally (i.e. without the removal of content).'
          ]}
          value={getSetting('dualControlEdits', false)}
          onChange={() => toggleSetting('dualControlEdits')}
        >
          Enable Dual Control Edits
        </SwitchItem>

        <SwitchItem
          note={'Set the right mouse button (RMB) as the primary control for performing message edits.'}
          value={getSetting('rightClickEdits', false)}
          onChange={() => toggleSetting('rightClickEdits')}
        >
          Swap Primary Button
        </SwitchItem>

        <SwitchItem
          note={'Remove message content during edits (not sure why you\'d have this enabled, but it\'s there if you ever need it).'}
          disabled={getSetting('dualControlEdits', false)}
          value={getSetting('clearContent', false)}
          onChange={() => toggleSetting('clearContent')}
        >
          Enable Clear Content
        </SwitchItem>

        <SwitchItem
          note={
            <span>Require the ‘⇧ Shift’ key to be held down prior to clicking the left or right mouse button to initiate an edit.&nbsp;
              <b style={{ color: 'rgb(240, 71, 71)' }}>HEADS UP:</b> Having this setting disabled will result in double-click edits by default. Don't say I didn't tell you.</span>
          }
          disabled={getSetting('dualControlEdits', false)}
          value={getSetting('useShiftKey', false)}
          onChange={() => toggleSetting('useShiftKey')}
        >
          Use Shift Key
        </SwitchItem>
      </div>
    );
  }
};

