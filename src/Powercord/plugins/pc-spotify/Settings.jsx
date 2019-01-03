const { React } = require('powercord/webpack');
const { TextInput } = require('powercord/components/settings');

module.exports = class SpotifySettings extends React.Component {
  constructor (props) {
    super();

    this.settings = props.settings;
    this.state = {
      token: props.settings.get('token')
    };
  }

  render () {
    const settings = this.state;

    const set = (key, value = !settings[key], defaultValue) => {
      if (!value && defaultValue) {
        value = defaultValue;
      }

      this.settings.set(key, value);
      this.setState({
        [key]: value
      });
    };

    return (
      <div>
        <TextInput
          note={(
            <span>
              Your Powercord Spotify access token. If you don't have one yet, you can get it from
              <a
                href='https://powercord.xyz'
                rel='noreferrer noopener'
                target='_blank'
              >
                here
              </a>.
            </span>
          )}
          defaultValue={settings.token}
          required={false}
          onChange={val => set('token', val, '')}
        >
          Token
        </TextInput>
      </div>
    );
  }
};
