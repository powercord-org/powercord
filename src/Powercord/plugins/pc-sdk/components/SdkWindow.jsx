const { Flux, React, getModule } = require('powercord/webpack');
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

class SdkWindow extends React.Component {
  componentDidMount () {
    this.htmlProps();
  }

  componentDidUpdate () {
    this.htmlProps();
  }

  async htmlProps () {
    const windowManager = await getModule([ 'getWindow' ]);
    const guestWindow = windowManager.getWindow('DISCORD_POWERCORD_SANDBOX');
    guestWindow.document.head.parentElement.className = [ `theme-${this.props.theme}`, this.props.fontScaleClass ].join(' ');
    guestWindow.document.head.parentElement.style = `font-size: ${this.props.fontScale}%`;
    guestWindow.document.head.parentElement.lang = this.props.locale;
  }

  render () {
    return <>
      <TitleBar type='WINDOWS' windowKey='DISCORD_POWERCORD_SANDBOX' themeOverride={this.props.theme}/>
    </>;
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
