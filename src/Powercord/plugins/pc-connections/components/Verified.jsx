const { React, Flux, getModule, getModuleByDisplayName, i18n: { Messages }, constants: { Colors } } = require('powercord/webpack');
const { AsyncComponent } = require('powercord/components');
const { TooltipContainer } = getModule(m => m.TooltipContainer, false);

const FlowerStarIcon = AsyncComponent.from(getModuleByDisplayName('FlowerStarIcon'));

let classes;
setImmediate(async () => {
  classes = { ...await getModule([ 'flowerStarContainer', 'flowerStar' ]) };
});

class Verified extends React.Component {
  render () {
    return <>
      <TooltipContainer element='span' text={Messages.CONNECTION_VERIFIED}>
        <div
          className={[ classes.flowerStarContainer, this.props.className ].filter(Boolean).join(' ')}
          style={{
            width: 16,
            height: 16
          }}
        >
          <FlowerStarIcon
            className={classes.flowerStar}
            color={this.props.theme === 'light' ? Colors.STATUS_GREY_200 : Colors.PRIMARY_DARK}
          />

          <div className={classes.childContainer}>
            <svg width={16} height={16} viewBox='0 0 16 15.2'>
              <path
                d='M7.4,11.17,4,8.62,5,7.26l2,1.53L10.64,4l1.36,1Z'
                fill={this.props.theme === 'light' ? Colors.STATUS_GREY_500 : Colors.WHITE}
              />
            </svg>
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
