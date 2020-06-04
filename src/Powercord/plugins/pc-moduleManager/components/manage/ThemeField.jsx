/* eslint-disable */
const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { TextInput, SwitchItem, ButtonItem, Category } = require('powercord/components/settings');
const { TabBar, Divider, Button, AsyncComponent } = require('powercord/components');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/ig;

class ThemeField extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      error: null,
      tab: 'SETTINGS'
    };
  }

  render () {
    const { option } = this.props;

    switch (option.type) {
      case 'string':
      case 'number':
      case 'url':
        return this.renderTextInput(option);
      case 'select':
        return <div>select</div>;
      case 'color':
      case 'color_alpha':
        return <div>color</div>;
      case 'background':
        return <div>background</div>;
      case 'font':
        return <div>font</div>;
    }
    return null;
  }

  renderTextInput (option) {
    return (
      <TextInput
        key={option.variable}
        note={option.description}
        error={this.state.error}
        placeholder={`Theme defaults${option.default ? ` (${option.default})` : ''}`}
        value={this.props.value}
        onChange={value => {
          if (option.type === 'string' && option.regex && !option.regex.test(value)) {
            return this.setState({ error: 'The value doesn\'t pass the validation put in place by the theme.' });
          }
          if (option.type === 'number' && !(/^\d*$/).test(value)) {
            return this.setState({ error: 'This is not a valid number.' });
          }
          if (option.type === 'url' && !URL_REGEX.test(value)) {
            return this.setState({ error: 'This is not a valid URL.' });
          }

          this.props.onChange(value);
        }}
      >
        {option.name}
      </TextInput>
    );
  }
}

module.exports = Flux.connectStores(
  [ powercord.api.settings.store ],
  ({ theme }) => ({
    ...powercord.api.settings._fluxProps(`theme-${theme}`)
  })
)(ThemeField);
