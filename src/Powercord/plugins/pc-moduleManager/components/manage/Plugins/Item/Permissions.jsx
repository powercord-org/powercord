const { React } = require('powercord/webpack');
const { Icon, Icons: { Keyboard, Security, ImportExport } } = require('powercord/components');

module.exports = ({ permissions }) =>
  <div className='powercord-plugin-permissions'>
    <div className='item'><Icon name='Key'/> This plugin will be able to:</div>
    {permissions.includes('keypresses') && <div className='item'><Keyboard/> Listen to keypresses even while Discord is not focused</div>}
    {permissions.includes('use_eud') && <div className='item'><Security/> Collect and use your data as soon as the plugin is installed</div>}
    {permissions.includes('ext_api') && <div className='item'><ImportExport/> Perform requests to other remote services</div>}
  </div>;
