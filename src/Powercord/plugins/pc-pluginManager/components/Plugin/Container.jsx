const { React } = require('powercord/webpack');
const {
  Tooltip, Icons: {
    Author, Version, Description, License, Info
  }
} = require('powercord/components');

module.exports = ({ author, version, description, license }) => {
  const versionInt = parseInt(version.replace(/\./g, ''));
  return <div className='powercord-plugin-container'>
    <div className='author'>
      <Tooltip text='Author(s)' position='top'>
        <Author/>
      </Tooltip>
      <span>{author}</span>
    </div>
    <div className='version'>
      <Tooltip text='Version' position='top'>
        <Version/>
      </Tooltip>
      <span>v{version}</span>
      {versionInt < 100 &&
      <Tooltip text='This plugin is in beta' position='top'>
        <Info/>
      </Tooltip>
      }
    </div>
    <div className='license'>
      <Tooltip text='License' position='top'>
        <License/>
      </Tooltip>
      <span>{license}</span>
    </div>
    <div className='description'>
      <Tooltip text='Description' position='top'>
        <Description/>
      </Tooltip>
      <span>{description}</span>
    </div>
  </div>;
};
