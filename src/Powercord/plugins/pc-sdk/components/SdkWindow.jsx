const { Flux, React, getModule } = require('powercord/webpack');
const { Card, Icon, FormTitle, Spinner, Button, Icons: { SdkWordmark }, AsyncComponent } = require('powercord/components');
const Badges = require('../../pc-badges/Badges');

const Helmet = AsyncComponent.from((async () => (await getModule([ 'Helmet ' ])).Helmet)());
const TitleBar = AsyncComponent.from((async () => {
  const titleBar = await getModule(m => typeof m === 'function' && m.toString().includes('PlatformTypes.WINDOWS') && m.toString().includes('PlatformTypes.OSX'));
  const windows = titleBar({ type: 'WINDOWS' }).type;
  return (props) => {
    const res = windows(props);
    res.props.children[0].props.children = React.createElement(SdkWordmark, { height: 16 });
    return res;
  };
})());

module.exports = class SdkWindow extends React.Component {
  render () {
    return <>
      <TitleBar type='WINDOWS' windowKey='DISCORD_POWERCORD_SANDBOX' themeOverride='dark'/>
      <Helmet>
        <html className='theme-dark powercord-sdk'/>
      </Helmet>
    </>;
  }
};
