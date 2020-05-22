const { Flux, React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { Icons: { SdkWordmark }, AsyncComponent } = require('powercord/components');

const TitleBar = AsyncComponent.from((async () => {
  const titleBar = await getModule(m => typeof m === 'function' && m.toString().includes('PlatformTypes.WINDOWS') && m.toString().includes('PlatformTypes.OSX'));
  const windows = titleBar({ type: 'WINDOWS' }).type;
  return (props) => {
    const res = windows(props);
    res.props.children[0].props.children = React.createElement(SdkWordmark, { height: 16 });
    return res;
  };
})());

const PopoutWindow = AsyncComponent.from(getModuleByDisplayName('FluxContainer(PopoutWindow)'));

class SdkWindow extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      winId: this.props.winId || 'DISCORD_POWERCORD_SANDBOX'
    };
  }

  render () {
    return <PopoutWindow>
      {process.platform !== 'linux' &&
      <TitleBar type='WINDOWS' windowKey={'DISCORD_POWERCORD_SANDBOX'} themeOverride={this.props.theme}/>}
      {this.props.children || null}
    </PopoutWindow>;
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'theme', 'locale' ]), getModule([ 'fontScale', 'darkSidebar' ]) ],
  ([ settings1Store, settings2Store ]) => ({
    locale: settings1Store.locale,
    theme: settings1Store.theme,
    fontScale: settings2Store.fontScale,
    fontScaleClass: settings2Store.fontScaleClass
  })
)(SdkWindow);
