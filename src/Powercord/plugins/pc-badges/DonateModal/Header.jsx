const { React, getModuleByDisplayName } = require('powercord/webpack');
const { AsyncComponent, Icons: { PowercordCutie } } = require('powercord/components');
const { close: closeModal } = require('powercord/modal');

module.exports = AsyncComponent.from((async () => {
  const premiumGuildModalHeader = await getModuleByDisplayName('PremiumGuildModalHeader');
  return props => {
    const res = premiumGuildModalHeader(props);
    res.props.children[2].props.onClick = () => closeModal();
    res.props.children[1] = [
      <div className='powercord-cutie'>
        <PowercordCutie height={28}/>
      </div>,
      <div className='powercord-cutie-flower'/>
    ];

    const PremiumPaymentGuildAnimation = res.props.children[0].type;
    res.props.children[0].type = class PowercordCutieAnimation extends PremiumPaymentGuildAnimation {
      render () {
        const res = super.render();
        const { importData } = res.props.children[0].props;
        res.props.children[0].props.importData = async () => {
          const data = await importData();
          data.layers[1].layers = data.layers[1].layers.filter(l => !l.nm.startsWith('crystal'));
          return data;
        };
        return res;
      }
    };
    return res;
  };
})());
