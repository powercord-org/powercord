const { Flux, React, getModule } = require('powercord/webpack');
const SplashScreen = require('./SplashScreen');
const Settings = require('./Settings');
const TitleBar = require('./TitleBar');

class SdkWindow extends React.PureComponent {
  render () {
    return <>
      <TitleBar type='WINDOWS' windowKey={'DISCORD_POWERCORD_SANDBOX'} themeOverride={this.props.theme}/>
      <div className='powercord-text powercord-sdk'>
        <SplashScreen/>
        <Settings/>
      </div>
    </>;
  }
}

module.exports = Flux.connectStoresAsync(
  [ getModule([ 'theme', 'locale' ]) ],
  ([ { theme } ]) => ({ theme })
)(SdkWindow);
