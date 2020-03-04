const { React, i18n: { Messages } } = require('powercord/webpack');
const { FormTitle, Icons: { Keyboard, PersonShield, Copy, ImportExport } } = require('powercord/components');

const perms = {
  keypresses: {
    icon: ({ svgSize }) => <Keyboard width={svgSize} height={svgSize}/>,
    text: () => Messages.POWERCORD_PLUGINS_PERMISSIONS_KEYPRESSES
  },
  use_eud: {
    icon: ({ svgSize }) => <PersonShield width={svgSize} height={svgSize}/>,
    text: () => Messages.POWERCORD_PLUGINS_PERMISSIONS_USE_EUD
  },
  filesystem: {
    icon: ({ svgSize }) => <Copy width={svgSize} height={svgSize}/>,
    text: () => Messages.POWERCORD_PLUGINS_PERMISSIONS_FS
  },
  ext_api: {
    icon: ({ svgSize }) => <ImportExport width={svgSize} height={svgSize}/>,
    text: () => Messages.POWERCORD_PLUGINS_PERMISSIONS_API
  }
};

module.exports = ({ permissions, svgSize }) =>
  <div className='powercord-product-permissions'>
    <FormTitle>{Messages.PERMISSIONS}</FormTitle>
    {Object.keys(perms).map(perm => permissions.includes(perm) &&
      <div className='item'>
        {React.createElement(perms[perm].icon, { svgSize })} {perms[perm].text()}
      </div>)}
  </div>;
