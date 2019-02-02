const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    const get = props.settings.get.bind(props.settings);

    this.state = {
      showControls: get('showControls', true),
      noAutoPause: get('noAutoPause', true)
    };
  }

  render () {
    const { showControls, noAutoPause } = this.state;

    return (
      <div>
        <SwitchItem
          note='Adds shuffle, repeat and other controls to the Spotify modal. Increases the height if enabled, if not these controls are available in the context menu'
          value={showControls}
          onChange={() => this._set('showControls')}
        >
          Show advanced controls
        </SwitchItem>

        <SwitchItem
          note={'Prevents Discord from automatically pausing Spotify playback if you\'re sending voice for more than 30 seconds'}
          value={noAutoPause}
          onChange={() => {
            this.props.patch(noAutoPause);
            this._set('noAutoPause');
          }}
        >
          No auto pause
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
