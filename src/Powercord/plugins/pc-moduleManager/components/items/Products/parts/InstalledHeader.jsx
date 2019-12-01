const { React } = require('powercord/webpack');
const { Tooltip, Switch } = require('powercord/components');

module.exports = ({ name, enabled, onDisable, onEnable }) =>
  <div className='powercord-plugin-header'>
    <h4>{name}</h4>
    <Tooltip text={enabled ? 'Disable' : 'Enable'} position='top'>
      <div>
        <Switch value={enabled} onChange={enabled ? onDisable : onEnable}/>
      </div>
    </Tooltip>
  </div>;
