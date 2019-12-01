const { React } = require('powercord/webpack');
const { FormTitle, Icon, Icons: { Keyboard, ImportExport } } = require('powercord/components');

const easterEgg = Math.floor(Math.random() * 1337) === 69;

const perms = {
  keypresses: {
    icon: () => <Keyboard/>,
    text: 'Listen to keypresses'
  },
  use_eud: {
    icon: () => <Icon name={easterEgg ? 'Facebook' : 'PersonShield'}/>,
    text: 'Collect and use your data'
  },
  filesystem: {
    icon: () => <Icon name='Copy'/>,
    text: 'Read and write files on your computer'
  },
  ext_api: {
    icon: () => <ImportExport/>,
    text: 'Perform requests to remote services'
  }
};

module.exports = ({ permissions }) =>
  <div className='powercord-plugin-permissions'>
    <FormTitle>Permissions</FormTitle>
    {Object.keys(perms).map(perm => permissions.includes(perm) &&
      <div className='item'>
        {React.createElement(perms[perm].icon)} {perms[perm].text}
      </div>)}
  </div>;
