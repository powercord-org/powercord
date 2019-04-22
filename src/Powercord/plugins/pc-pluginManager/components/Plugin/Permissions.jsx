const { React } = require('powercord/webpack');
const { Icons: { Key, Keyboard, Security } } = require('powercord/components');

module.exports = ({ permissions }) =>
  <div className='powercord-plugin-permissions'>
    <div className='item'><Key/> This plugin will be able to:</div>
    {permissions.includes('keypresses') && <div className='item'><Keyboard/> Listen to keypresses even while Discord is not focused</div>}
    {permissions.includes('use_eud') && <div className='item'><Security/> Collect and use your data as soon as the plugin is installed</div>}
  </div>;
