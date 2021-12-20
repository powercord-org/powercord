const { React, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Icons: { PowercordCutie } } = require('powercord/components');
const { close: closeModal } = require('powercord/modal');

module.exports = AsyncComponent.from((async () => {
  const GuildBoostingModalsHeader = await getModuleByDisplayName('GuildBoostingModalsHeader');
  return () => {
    const res = React.createElement(GuildBoostingModalsHeader, { onClose: closeModal });

    const renderer = res.type;
    res.type = (props) => {
      const res = renderer(props);
      res.props.children[1] =
        <div className='powercord-cutie'>
          <PowercordCutie height={32}/>
        </div>;

      return res;
    };
    return res;
  };
})());
