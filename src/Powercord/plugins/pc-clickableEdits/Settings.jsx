const { React } = require('powercord/webpack');
const { getOwnerInstance } = require('powercord/util');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.settings.get.bind(props.settings);

    this.state = {
      rightClickEdits: get('rightClickEdits', false),
      clearContent: get('clearContent', false),
      useShiftKey: get('useShiftKey', false)
    };
  }

  render () {
    const { rightClickEdits, clearContent, useShiftKey } = this.state;

    return (
      <div>
        <SwitchItem
          note={'Sets the right mouse button (RMB) as the primary control for performing message edits.'}
          value={rightClickEdits}
          onChange={() => {
            this._set('rightClickEdits');

            for (const elem of [ ...document.querySelectorAll('.pc-message') ]) {
              getOwnerInstance(elem).forceUpdate();
            }
          }}
        >
          Swap Primary Button
        </SwitchItem>

        <SwitchItem
          note={'Removes the message content upon editing (not sure why you\'d have this enabled, but it\'s there if you ever need it).'}
          value={clearContent}
          onChange={() => {
            this._set('clearContent');
          }}
        >
          Enable Clear Content
        </SwitchItem>

        <SwitchItem
          note={'Makes it so that the ‘shift’ key must be held down before clicking the left or right mouse button to initiate an edit.'}
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
