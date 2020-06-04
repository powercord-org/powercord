/* eslint-disable */
const { default: SystemFonts } = require('system-font-families');
const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { TextInput, SwitchItem, ButtonItem, SelectInput, ColorPickerInput } = require('powercord/components/settings');
const { TabBar, Divider, Button, AsyncComponent } = require('powercord/components');

const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/ig;

let fonts = null
const systemFonts = new SystemFonts();
const fontsPromise = systemFonts.getFonts().then(f => (fonts = f))

class ThemeField extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      error: null,
      tab: 'SETTINGS',
      fonts
    };
  }

  componentDidMount () {
    if (this.props.option.type === 'font' && !this.state.fonts) {
      fontsPromise.then(fonts => {
        this.setState({ fonts })
      })
    }
  }

  render () {
    const { option } = this.props;
    switch (option.type) {
      case 'string':
      case 'number':
      case 'url':
        return this.renderTextInput(option);
      case 'select':
        return this.renderSelectInput(option);
      case 'color':
      case 'color_alpha':
        return this.renderColorInput(option);
      case 'background':
        return <div>background</div>;
      case 'font':
        return this.renderFontInput(option);
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

  renderSelectInput (option, searchable = false) {
    return (
      <SelectInput
        key={option.variable}
        note={option.description}
        error={this.state.error}
        value={this.props.value}
        placeholder={`Theme defaults${option.default ? ` (${option.default})` : ''}`}
        onChange={opt => this.props.onChange(opt ? opt.value : null)}
        options={option.options}
        searchable={searchable}
        lazySearch
        clearable
      >
        {option.name}
      </SelectInput>
    );
  }

  renderColorInput (option) {
    return (
      <ColorPickerInput
        key={option.variable}
        note={option.description}
        error={this.state.error}
        value={this.props.value}
        default={option.default}
        transparency={option.type === 'color_alpha'}
        onChange={c => console.log(c)}
      >
      {option.name}
    </ColorPickerInput>
    )
  }

  renderFontInput (option) {
    const options = this.state.fonts ? this.state.fonts.map(f => ({ label: f, value: f })) : []
    return this.renderSelectInput({
      ...option,
      options
    }, true)
  }
}

module.exports = Flux.connectStores(
  [ powercord.api.settings.store ],
  ({ theme }) => ({
    ...powercord.api.settings._fluxProps(`theme-${theme}`)
  })
)(ThemeField);
