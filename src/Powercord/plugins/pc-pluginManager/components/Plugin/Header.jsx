const { React } = require('powercord/webpack');
const { Tooltip, Switch } = require('powercord/components');

module.exports = ({ name, installed, enabled, onDisable, onEnable }) =>
  <div className='powercord-plugin-header'>
    <h4>{name}</h4>
    {installed &&
    <Tooltip text={enabled ? 'Disable' : 'Enable'} position='top'>
      <div>
        <Switch value={enabled} onChange={enabled ? onDisable : onEnable}/>
      </div>
    </Tooltip>}
  </div>;
