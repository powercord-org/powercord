const { React } = require('powercord/webpack');
const { FormTitle, Icon, Icons: { Keyboard, ImportExport } } = require('powercord/components');

const easterEgg = Math.floor(Math.random() * 1337) === 69;

const perms = {
  keypresses: {
    icon: ({ svgSize }) => <Keyboard width={svgSize} height={svgSize}/>,
    text: 'Listen to keypresses'
  },
  use_eud: {
    icon: ({ svgSize }) => <Icon width={svgSize} height={svgSize} name={easterEgg ? 'Facebook' : 'PersonShield'}/>,
    text: 'Collect and use your data'
  },
  filesystem: {
    icon: ({ svgSize }) => <Icon width={svgSize} height={svgSize} name='Copy'/>,
    text: 'Read and write files on your computer'
  },
  ext_api: {
    icon: ({ svgSize }) => <ImportExport width={svgSize} height={svgSize}/>,
    text: 'Perform requests to remote services'
  }
};

module.exports = ({ permissions, svgSize }) =>
  <div className='powercord-product-permissions'>
    <FormTitle>Permissions</FormTitle>
    {Object.keys(perms).map(perm => permissions.includes(perm) &&
      <div className='item'>
        {React.createElement(perms[perm].icon, { svgSize })} {perms[perm].text}
      </div>)}
  </div>;
