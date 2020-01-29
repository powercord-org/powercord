const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');
const { AsyncComponent } = require('powercord/components');

const FormTitle = AsyncComponent.from(getModuleByDisplayName('FormTitle'));
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));
const Checkbox = AsyncComponent.from(getModuleByDisplayName('Checkbox'));
const Clickable = AsyncComponent.from(getModuleByDisplayName('Clickable'));

const translate = require('google-translate-api');

module.exports = class Settings extends React.Component {
  constructor (props) {
    super(props);

    this.languages = props.main.state.languages.filter(lang => lang !== 'auto');
    this.state = {
      classes: {}
    };
  }

  async componentDidMount () {
    this.setState({
      Flex: await getModuleByDisplayName('Flex'),
      classes: {
        ...await getModule([ 'checkboxGroup' ]),
        ...await getModule([ 'formText', 'description' ]),
        ...await getModule([ 'marginBottom20' ])
      }
    });
  }

  render () {
    if (!this.state.Flex) {
      return null;
    }

    const { Flex, classes } = this.state;
    const FlexChild = Flex.prototype.constructor.Child;

    const hiddenLanguages = this.props.getSetting('hiddenLanguages', []);
    const languagesFiltered = this.languages
      .map((_, index) => index % 26 === 0 && this.languages.slice(index, index + 26))
      .filter(lang => lang);

    return (
      <div>
        <SwitchItem
          note='Move most frequently used languages to the top of the list and leave the rest that remain in alphabetical order.'
          value={this.props.getSetting('sortByUsage', false)}
          onChange={() => this.props.toggleSetting('sortByUsage')}
        >
          Prioritize Languages by Usage
        </SwitchItem>

        <FormTitle>Hidden Languages</FormTitle>
        <FormText className={[ classes.description, classes.marginBottom20 ].join(' ')}>
          Here you can decide which of the languages are to be hidden from the "Translate" sub-menu.&nbsp;
          {this.getShowHideButton()}.
        </FormText>
        <Flex id='powercord-translate-settings'>
          {languagesFiltered.map(group =>
            <FlexChild>
              <ul className={classes.checkboxGroup}>
                {group.map(lang =>
                  <li key={translate.languages[lang]} className={classes.marginBottom20}>
                    <Checkbox
                      className='languageCheckbox'
                      size={16}
                      shape='round-2jCFai'
                      type='ghost'
                      value={hiddenLanguages.includes(lang)}
                      onChange={() => this.props.main.settings.set('hiddenLanguages',
                        !hiddenLanguages.includes(lang)
                          ? [ ...hiddenLanguages, lang ]
                          : hiddenLanguages.filter(hiddenLang => hiddenLang !== lang))
                      }
                    >
                      <span>{Messages[lang] || translate.languages[lang]}</span>
                    </Checkbox>
                  </li>
                )}
              </ul>
            </FlexChild>
          )}
        </Flex>
      </div>
    );
  }

  getShowHideButton () {
    const hiddenLanguages = this.props.getSetting('hiddenLanguages', []);
    const set = (newValue) => this.props.main.settings.set('hiddenLanguages', newValue);
    const onClick = () => hiddenLanguages.length >= this.languages.length
      ? set([])
      : set(this.languages);

    const props = {
      tag: 'a',
      onClick
    };

    if (hiddenLanguages.length >= this.languages.length) {
      return <Clickable {...props}>Show all languages</Clickable>;
    }

    return <Clickable {...props}>Hide all languages</Clickable>;
  }
};
