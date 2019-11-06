const { React, getModule, contextMenu } = require('powercord/webpack');
const { Tooltip, ContextMenu } = require('powercord/components');

const translate = require('google-translate-api');

module.exports = class HeaderIcon extends React.PureComponent {
  constructor () {
    super();

    this.state = {
      classes: '',
      selected: false
    };
  }

  async componentDidMount () {
    const classes = await getModule([ 'iconWrapper', 'selected' ]);
    this.setState({ classes });
  }

  handleClick () {
    this.setState({ selected: !this.state.selected });
    this.props.onClick();
  }

  handleContextMenu (e) {
    const languages = this.props.main.state.languages
      .filter(lang => !this.props.main.settings.get('hiddenLanguages', []).includes(lang))
      .sort((a, b) => {
        if (b === 'auto') {
          return 1;
        }

        const usageHistory = this.props.main.settings.get('usageHistory', {});
        const frequentlyUsed = Object.keys(usageHistory).sort((a, b) => usageHistory[a] - usageHistory[b]);
        return this.props.main.settings.get('sortByUsage', false)
          ? frequentlyUsed.indexOf(b) - frequentlyUsed.indexOf(a)
          : null;
      });

    contextMenu.openContextMenu(e, () =>
      React.createElement(ContextMenu, {
        width: '50px',
        itemGroups: [ languages.map(lang => ({
          type: 'button',
          name: translate.languages[lang],
          onClick: () => this.setState({ selected: true }),
          disabled: lang !== 'auto' ? true : ''
        })) ]
      })
    );
  }

  render () {
    const { classes, selected } = this.state;
    return React.createElement(Tooltip, {
      text: `${(selected ? 'Restore' : 'Translate')} Channel Messages`,
      position: 'bottom'
    }, React.createElement('div', {
      tabIndex: '0',
      className: [ classes.iconWrapper, classes.clickable, selected ? classes.selected : null ].filter(Boolean).join(' '),
      onClick: this.handleClick.bind(this),
      onContextMenu: this.handleContextMenu.bind(this),
      role: 'button'
    }, React.createElement('svg', {
      className: classes.icon,
      width: '24',
      height: '24',
      viewBox: '0 0 22 20',
      style: { width: '20px' }
    }, React.createElement('path', {
      fill: 'currentColor',
      'fill-rule': 'evenodd',
      d: 'M11.87 13.07l-2.54-2.51.03-.03A17.52 17.52 0 0 0 13.07 4H16V2H9V0H7v2H0v2h11.17C10.5 5.92 9.44 7.75 8 9.35 7.07 8.32 6.3 7.19 5.69 6h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L3 17l5-5 3.11 3.11.76-2.04zM17.5 8h-2L11 20h2l1.12-3h4.75L20 20h2L17.5 8zm-2.62 7l1.62-4.33L18.12 15h-3.24z'
    }))));
  }
};
