const { React } = require('powercord/webpack');
const { Icon, Icons: { Keyboard, ImportExport } } = require('powercord/components');

const easterEgg = Math.floor(Math.random() * 1337) === 69;

module.exports = ({ permissions }) =>
  <div className='powercord-plugin-permissions'>
    <div className='item'><Icon name='Key'/> This plugin will be able to:</div>
    {permissions.includes('keypresses') && <div className='item'>
      <Keyboard/> Listen to keypresses even while Discord is not focused
    </div>}
    {permissions.includes('use_eud') && <div className='item'>
      <Icon name={easterEgg ? 'Facebook' : 'PersonShield'}/> Collect and use your data as soon as the plugin is installed
    </div>}
    {permissions.includes('ext_api') && <div className='item'>
      <ImportExport/> Perform requests to other remote services
    </div>}
  </div>;
