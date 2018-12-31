const { React } = require('powercord/webpack'); // eslint-disable-line no-unused-vars
const { KeybindRecorder } = require('powercord/components/settings');

module.exports = () => <div>
  {this.props.keybinds.map(keybind => <KeybindRecorder
    key={keybind.id}
    value={keybind.keybind}
    note={keybind.description}
    onChange={(v) => this.props.onChange(keybind.id, v)}
    onReset={() => {
      this.props.onChange(keybind.id, null);
      this.forceUpdate();
    }}
    onRecord={() => this.props.onRecord(keybind.id)}
  >{keybind.name}</KeybindRecorder>)}
</div>;
