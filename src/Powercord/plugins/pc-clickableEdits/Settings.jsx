const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.settings.get.bind(props.settings);

    this.state = {
      dualControlEdits: get('dualControlEdits', false),
      rightClickEdits: get('rightClickEdits', false),
      clearContent: get('clearContent', false),
      useShiftKey: get('useShiftKey', false)
    };
  }

  render () {
    const { dualControlEdits, rightClickEdits, clearContent, useShiftKey } = this.state;

    return (
      <div>
        <SwitchItem
          note={'Provides the ability to use the ‘shift’ key and primary button to perform cleared message edits while also ' +
            'being able to double-click the primary button to edit messages normally (without the removable of content).'}
          value={dualControlEdits}
          onChange={() => {
            this._set('dualControlEdits');
          }}
        >
          Enable Dual Control Edits
        </SwitchItem>

        <SwitchItem
          note={'Sets the right mouse button (RMB) as the primary control for performing message edits.'}
          value={rightClickEdits}
          onChange={() => {
            this._set('rightClickEdits');
          }}
        >
          Swap Primary Button
        </SwitchItem>

        <SwitchItem
          note={'Removes the message content upon editing (not sure why you\'d have this enabled, but it\'s there if you ever need it).'}
          disabled={dualControlEdits}
          value={clearContent}
          onChange={() => {
            this._set('clearContent');
          }}
        >
          Enable Clear Content
        </SwitchItem>

        <SwitchItem
          note={
            <span>Makes it so that the ‘shift’ key must be held down before clicking the left or right mouse button to initiate an edit.
              <b style={{ color: 'rgb(240, 71, 71)' }}>HeAdS uP:</b> Having this setting disabled will result in double-click edits by default. Don't say I didn't tell you.</span>
          }
          disabled={dualControlEdits}
          value={useShiftKey}
          onChange={() => {
            this._set('useShiftKey');
          }}
        >
          Use Shift Key
        </SwitchItem>
      </div>
    );
  }

  _set (key, value = !this.state[key], defaultValue) {
    if (!value && defaultValue) {
      value = defaultValue;
    }

    this.props.settings.set(key, value);
    this.setState({ [key]: value });
  }
};
