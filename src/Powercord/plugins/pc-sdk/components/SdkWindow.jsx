const { Flux, React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Tooltip, HeaderBar, Clickable, Icons } = require('powercord/components');
const ForceUI = require('./ForceUI');
const SplashScreen = require('./SplashScreen');
const Settings = require('./Settings');
const TitleBar = require('./TitleBar');

const VerticalScroller = AsyncComponent.from(getModuleByDisplayName('VerticalScroller'));

class SdkWindow extends React.PureComponent {
  constructor (props) {
    super(props);
    this.scrollerRef = React.createRef();
  }

  render () {
    return (
      <>
        <TitleBar type='WINDOWS' windowKey={'DISCORD_POWERCORD_SANDBOX'} themeOverride={this.props.theme}/>
        <div className='powercord-text powercord-sdk'>
          {this.renderHeaderBar()}
          <VerticalScroller _pass={{ ref: this.scrollerRef }}>
            <div className='powercord-sdk-container'>
              <ForceUI/>
              <SplashScreen/>
              <Settings/>
            </div>
          </VerticalScroller>
        </div>
      </>
    );
  }

  renderHeaderBar () {
    const { title } = getModule([ 'title', 'chatContent' ], false);
    return (
      <HeaderBar transparent={false} className={title}>
        {this.renderIcon('Force UI', 'Arch', 'force-ui', 'right')}
        {this.renderIcon('Discord Splash Screen', 'Arch', 'splash-screen')}
        {this.renderIcon('SDK Settings', 'Gear', 'sdk-settings')}
        {this.props.windowOnTop
          ? this.renderIcon(Messages.POPOUT_REMOVE_FROM_TOP, 'Unpin', null, 'left')
          : this.renderIcon(Messages.POPOUT_STAY_ON_TOP, 'Pin', null, 'left')}
      </HeaderBar>
    );
  }

  renderIcon (tooltip, icon, id, placement = 'bottom') {
    const headerBarClasses = getModule([ 'iconWrapper', 'clickable' ], false);
    const Icon = Icons[icon];
    return (
      <Tooltip text={tooltip} position={placement}>
        <Clickable
          className={[ headerBarClasses.iconWrapper, headerBarClasses.clickable ].join(' ')}
          onClick={async () => {
            if (!id) {
              // Consider this is the always on top thing
              const popoutModule = await getModule([ 'setAlwaysOnTop', 'open' ]);
              return popoutModule.setAlwaysOnTop('DISCORD_POWERCORD_SANDBOX', !this.props.windowOnTop);
            }
            const el = this.props.guestWindow.document.getElementById(id);
            this.scrollerRef.current.scrollIntoView(el);
          }}
        >
          <Icon className={headerBarClasses.icon}/>
        </Clickable>
      </Tooltip>
    );
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'theme', 'locale' ]), getModule([ 'getWindow' ]) ],
  ([ { theme }, windowStore ]) => ({
    guestWindow: windowStore.getWindow('DISCORD_POWERCORD_SANDBOX'),
    windowOnTop: windowStore.getIsAlwaysOnTop('DISCORD_POWERCORD_SANDBOX'),
    theme
  })
)(SdkWindow);
