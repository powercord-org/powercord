const { React } = require('powercord/webpack');
const { open: openModal } = require('powercord/modal');
const { Clickable, Tooltip, Icon, Icons: { Chemistry } } = require('powercord/components');

const LicenseModal = require('../../../License');
const licenses = require('../../../../licenses');

// @todo: merge with Product/
module.exports = React.memo(
  ({ author, version, description, license }) =>
    <div className='powercord-plugin-container'>
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
        {version.startsWith('0') &&
        <Tooltip text='This plugin is in beta' position='top'>
          <Chemistry/>
        </Tooltip>}
      </div>
      <div className='license'>
        <Tooltip text='License' position='top'>
          <Icon name='Scale'/>
        </Tooltip>
        <span>{license}</span>
        {licenses[license] &&
        <Clickable onClick={() => openModal(() => <LicenseModal license={licenses[license]}/>)}>
          <Tooltip text='Learn more' position='top'>
            <Icon name='Info'/>
          </Tooltip>
        </Clickable>}
      </div>
      <div className='description'>
        <Tooltip text='Description' position='top'>
          <Icon name='Receipt'/>
        </Tooltip>
        <span>{description}</span>
      </div>
    </div>
);
