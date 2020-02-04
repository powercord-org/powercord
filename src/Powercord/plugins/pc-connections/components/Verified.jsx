const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages }, constants: { Colors } } = require('powercord/webpack');
const { AsyncComponent, Icon } = require('powercord/components');
const { TooltipContainer } = getModule(m => m.TooltipContainer, false);

const FlowerStarIcon = AsyncComponent.from(getModuleByDisplayName('FlowerStarIcon'));

class Verified extends React.Component {
  constructor () {
    super();

    this.state = { classes: null };
  }

  async componentDidMount () {
    this.setState({
      classes: { ...await getModule([ 'flowerStarContainer', 'flowerStar' ]) }
    });
  }

  render () {
    if (!this.state.classes) {
      return null;
    }

    const { classes } = this.state;

    return <>
      <TooltipContainer element='span' text={Messages.CONNECTION_VERIFIED}>
        <div
          className={[ classes.flowerStarContainer, this.props.className ].filter(Boolean).join(' ')}
          style={{
            width: this.props.width || 16,
            height: this.props.height || 16
          }}
        >
          <FlowerStarIcon
            className={classes.flowerStar}
            color={this.props.theme === 'light' ? Colors.STATUS_GREY_200 : Colors.PRIMARY_DARK}
            size={this.props.size}
          />

          <div className={classes.childContainer}>
            <Icon name='Verified' color={this.props.theme === 'light' ? Colors.STATUS_GREY_500 : Colors.WHITE}/>
          </div>
        </div>
      </TooltipContainer>
    </>;
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'theme', 'locale' ]) ],
  ([ settingsStore ]) => ({ theme: settingsStore.theme })
)(Verified);
