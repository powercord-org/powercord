const { React, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Icons: { PowercordCutie } } = require('powercord/components');
const { close: closeModal } = require('powercord/modal');

module.exports = AsyncComponent.from((async () => {
  const PremiumGuildModalHeader = await getModuleByDisplayName('PremiumGuildModalHeader');
  return () => {
    const res = React.createElement(PremiumGuildModalHeader, { onClose: closeModal });

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
