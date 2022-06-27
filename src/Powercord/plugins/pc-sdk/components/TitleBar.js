const { React, getModule } = require('powercord/webpack');
const { Icons: { SdkWordmark }, AsyncComponent } = require('powercord/components');
const { wrapInHooks } = require('powercord/util');

module.exports = AsyncComponent.from((async () => {
  const titleBar = await getModule(m => typeof m === 'function' && m.toString().includes('PlatformTypes.WINDOWS') && m.toString().includes('PlatformTypes.OSX'));

  return (props) => {
    const windows = wrapInHooks(() => titleBar(props))().type;

    const res = windows(props);
    res.props.className += ' powercord-sdk-title';
    res.props.children[0].props.children = React.createElement(SdkWordmark, { height: 16 });
    return res;
  };
})());
