module.exports = () => null;

/*
const { React, getModule, getModuleByDisplayName, modal } = require('powercord/webpack');
const { AsyncComponent, Icons: { PowercordCutie } } = require('powercord/components');
const { close: closeModal } = require('powercord/modal');
const { sleep } = require('powercord/util');

module.exports = AsyncComponent.from((async () => {
  let GuildBoostingModalsHeader = await getModuleByDisplayName('GuildBoostingModalsHeader');
  if (!GuildBoostingModalsHeader) {
    await sleep(1e3);

    let promise;
    const boostModule = await getModule([ 'addAppliedGuildBoosts' ]);
    const ogOpenLazy = modal.openModalLazy;
    modal.openModalLazy = (a) => promise = a();
    await boostModule.addAppliedGuildBoosts({ guild: {} });
    modal.openModalLazy = ogOpenLazy;
    await promise;
    GuildBoostingModalsHeader = await getModuleByDisplayName('GuildBoostingModalsHeader');
  }

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
*/
