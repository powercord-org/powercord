const { React } = require('powercord/webpack');
const { Tooltip, Icon } = require('powercord/components');

module.exports = ({ author, version, description, license }) => {
  const versionInt = parseInt(version.replace(/\./g, ''));
  return <div className='powercord-plugin-container'>
    <div className='author'>
      <Tooltip text='Author(s)' position='top'>
        <Icon name='Person'/>
      </Tooltip>
      <span>{author}</span>
    </div>
    <div className='version'>
      <Tooltip text='Version' position='top'>
        <Icon name='StoreTag'/>
      </Tooltip>
      <span>v{version}</span>
      {versionInt < 100 &&
      <Tooltip text='This plugin is in beta' position='top'>
        <Icon name='Info'/>
      </Tooltip>}
    </div>
    <div className='license'>
      <Tooltip text='License' position='top'>
        <Icon name='Scale'/>
      </Tooltip>
      <span>{license}</span>
    </div>
    <div className='description'>
      <Tooltip text='Description' position='top'>
        <Icon name='Receipt'/>
      </Tooltip>
      <span>{description}</span>
    </div>
  </div>;
};
