const { React, getModule } = require('powercord/webpack');
const { SwitchItem, TextInput } = require('powercord/components/settings');
const { existsSync, lstatSync } = require('fs');

const { getGuild } = getModule([ 'getGuild' ]);

module.exports = class EmojiUtilitySettings extends React.Component {
  constructor (props) {
    super();

    this.settings = props.settings;
    this.state = Object.assign({
      isFilePathValid: props.settings.get('filePath') ? existsSync(props.settings.get('filePath')) : true,
      initialFilePathValue: props.settings.get('filePath') || null,

      isCloneIdValid: props.settings.get('defaultCloneId') ? getGuild(props.settings.get('defaultCloneId')) : true,
      initialCloneIdValue: props.settings.get('defaultCloneId') || null
    }, this.settings.config);
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
        <SwitchItem
          note='Whether Emote Utility should return responses in embeds.'
          value={settings.useEmbeds}
          onChange={() => set('useEmbeds')}
        >
          Use embeds
        </SwitchItem>

        {!settings.useEmbeds && (
          <SwitchItem
            note='Whether the message for the findemote command should contain the link to the guild the emote is in.'
            value={settings.displayLink}
            onChange={() => set('displayLink')}
          >
            Display link
          </SwitchItem>
        )}

        <TextInput
          note='The directory emotes will be saved to.'
          defaultValue={settings.filePath}
          style={!this.state.isFilePathValid ? { borderColor: 'red' } : {}}
          onChange={(value) => {
            if (value.length === 0 || (existsSync(value) && lstatSync(value).isDirectory())) {
              this.setState({
                isFilePathValid: true
              });

              set('filePath', value.length === 0 ? null : value);
            } else {
              this.setState({
                isFilePathValid: false
              });

              set('filePath', this.state.initialFilePathValue);
            }
          }}
        >
          Save directory
        </TextInput>

        <SwitchItem
          note='Whether saving emotes should contain the id of the emote, this prevents overwriting old saved emotes.'
          value={settings.includeIdForSavedEmojis}
          onChange={() => set('includeIdForSavedEmojis')}
        >
          Include ID when saving emotes
        </SwitchItem>

        <SwitchItem
          note='Whether the default server for cloning emotes should be the server you are currently in.'
          value={settings.defaultCloneIdUseCurrent}
          onChange={() => set('defaultCloneIdUseCurrent')}
        >
          Use current server when cloning emotes
        </SwitchItem>

        {!settings.defaultCloneIdUseCurrent && (
          <TextInput
            note='The default server id which will be used to save cloned emotes.'
            defaultValue={settings.defaultCloneId}
            style={!this.state.isCloneIdValid ? { borderColor: 'red' } : {}}
            onChange={(value) => {
              if (value.length === 0 || getGuild(value)) {
                this.setState({
                  isCloneIdValid: true
                });

                set('defaultCloneId', value.length === 0 ? null : value);
              } else {
                this.setState({
                  isCloneIdValid: false
                });

                set('defaultCloneId', this.state.initialCloneIdValue);
              }
            }}
          >
            Default server ID when cloning emotes
          </TextInput>
        )}
      </div>
    );
  }
};
