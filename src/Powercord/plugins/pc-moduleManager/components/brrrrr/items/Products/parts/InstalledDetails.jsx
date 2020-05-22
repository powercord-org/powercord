const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal } = require('powercord/modal');
const { Clickable, Tooltip, Icons: { Person, Tag, Chemistry, Scale, Info, Receipt } } = require('powercord/components');

const LicenseModal = require('../../../../License');
const licenses = require('../../../../../licenses');

// @todo: merge with Product/
module.exports = React.memo(
  ({ author, version, description, license }) =>
    <div className='powercord-plugin-container'>
      <div className='author'>
        <Tooltip text={Messages.APPLICATION_STORE_DETAILS_DEVELOPER} position='top'>
          <Person/>
        </Tooltip>
        <span>{author}</span>
      </div>
      <div className='version'>
        <Tooltip text={Messages.POWERCORD_PLUGINS_VERSION} position='top'>
          <Tag/>
        </Tooltip>
        <span>v{version}</span>
        {version.startsWith('0') &&
        <Tooltip text={Messages.BETA} position='top'>
          <Chemistry/>
        </Tooltip>}
      </div>
      <div className='license'>
        <Tooltip text={Messages.POWERCORD_PLUGINS_LICENSE} position='top'>
          <Scale/>
        </Tooltip>
        <span>{license}</span>
        {licenses[license] &&
        <Clickable onClick={() => openModal(() => <LicenseModal spdx={license} license={licenses[license]}/>)}>
          <Tooltip text={Messages.LEARN_MORE} position='top'>
            <Info/>
          </Tooltip>
        </Clickable>}
      </div>
      <div className='description'>
        <Tooltip text={Messages.DESCRIPTION} position='top'>
          <Receipt/>
        </Tooltip>
        <span>{description}</span>
      </div>
    </div>
);
