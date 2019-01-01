const { React } = require('powercord/webpack');
const { KeybindRecorder } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  render () {
    const { keybinds } = powercord.pluginManager.get('pc-keybindManager');

    return (
      <div>
        {keybinds.map(keybind => <KeybindRecorder
          key={keybind.id}
          value={keybind.keybind}
          note={keybind.description}
          onChange={(v) => {
            this.props.onChange(keybind.id, v);
            this.forceUpdate();
          }}
          onReset={() => {
            this.props.onChange(keybind.id, null);
            this.forceUpdate();
          }}
          onRecord={() => this.props.onRecord(keybind.id)}
        >{keybind.name}</KeybindRecorder>)}
      </div>
    );
  }
};
