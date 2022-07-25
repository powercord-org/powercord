const { React, i18n: { Messages } } = require('powercord/webpack');
const { open: openModal } = require('powercord/modal');
const { Clickable, Tooltip, Icons: { Receipt, Person, Tag, Chemistry, Scale, Info } } = require('powercord/components');

const LicenseModal = require('../License');
const licenses = require('../../licenses');

module.exports = React.memo(
  ({ author, version, description, license, svgSize }) => (
    <div className='powercord-product-details'>
      <div className='description'>
        <Tooltip text={Messages.DESCRIPTION} position='top'>
          <Receipt width={svgSize} height={svgSize}/>
        </Tooltip>
        <span>{description}</span>
      </div>
      <div className='metadata'>
        <div className='author'>
          <Tooltip text={Messages.APPLICATION_STORE_DETAILS_DEVELOPER} position='top'>
            <Person width={svgSize} height={svgSize}/>
          </Tooltip>
          <span>{author}</span>
        </div>
        <div className='version'>
          <Tooltip text={Messages.REPLUGGED_PLUGINS_VERSION} position='top'>
            <Tag width={svgSize} height={svgSize}/>
          </Tooltip>
          <span>v{version}</span>
          {(/(?:^0|-beta\d*$)/).test(version) &&
          <Tooltip text={Messages.BETA} position='top'>
            <Chemistry width={18} height={18}/>
          </Tooltip>}
        </div>
        <div className='license'>
          <Tooltip text={Messages.REPLUGGED_PLUGINS_LICENSE} position='top'>
            <Scale width={svgSize} height={svgSize}/>
          </Tooltip>
          <span>{license}</span>
          {licenses[license] &&
          <Clickable onClick={() => openModal(() => <LicenseModal spdx={license} license={licenses[license]}/>)}>
            <Tooltip text={Messages.LEARN_MORE} position='top'>
              <Info width={14} height={14}/>
            </Tooltip>
          </Clickable>}
        </div>
      </div>
    </div>
  )
);
