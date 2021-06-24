/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const { shell: { openExternal } } = require('electron');
const { open: openModal } = require('powercord/modal');
const { gotoOrJoinServer } = require('powercord/util');
const { Clickable, Tooltip, Icons: { badges: BadgeIcons } } = require('powercord/components');
const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { WEBSITE, I18N_WEBSITE, DISCORD_INVITE, REPO_URL } = require('powercord/constants');
const DonateModal = require('./DonateModal');

const Base = React.memo(({ color, tooltip, tooltipPosition, onClick, className, children }) => {
  const { profileBadge22 } = getModule([ 'profileBadge22' ], false);
  return (
    <Clickable onClick={onClick || (() => void 0)} className='powercord-badge-wrapper'>
      <Tooltip text={tooltip} position={tooltipPosition || 'top' } spacing={24}>
        <div className={`${profileBadge22} powercord-badge ${className}`} style={{ color: `#${color || '7289da'}` }}>
          {children}
        </div>
      </Tooltip>
    </Clickable>
  );
});

const Custom = React.memo(({ name, icon, tooltipPosition }) => (
  <Base
    tooltipPosition={tooltipPosition}
    onClick={() => openModal(DonateModal)}
    className='powercord-badge-cutie'
    tooltip={name}
  >
    <img src={icon} alt='Custom badge'/>
  </Base>
));

const Developer = React.memo(({ color }) => (
  <Base
    onClick={() => openExternal(`${WEBSITE}/contributors`)}
    className='powercord-badge-developer'
    tooltip={Messages.POWERCORD_BADGES_DEVELOPER}
    color={color}
  >
    <BadgeIcons.Developer/>
  </Base>
));

const Staff = React.memo(({ color }) => (
  <Base
    onClick={() => gotoOrJoinServer(DISCORD_INVITE)}
    className='powercord-badge-staff'
    tooltip={Messages.POWERCORD_BADGES_STAFF}
    color={color}
  >
    <BadgeIcons.Staff/>
  </Base>
));

const Support = React.memo(({ color }) => (
  <Base
    onClick={() => gotoOrJoinServer(DISCORD_INVITE)}
    className='powercord-badge-support'
    tooltip={Messages.POWERCORD_BADGES_SUPPORT}
    color={color}
  >
    <BadgeIcons.Support/>
  </Base>
));

const Contributor = React.memo(({ color }) => (
  <Base
    onClick={() => openExternal(`${WEBSITE}/contributors`)}
    className='powercord-badge-contributor'
    tooltip={Messages.POWERCORD_BADGES_CONTRIBUTOR}
    color={color}
  >
    <BadgeIcons.Contributor/>
  </Base>
));

const Translator = React.memo(({ color }) => ( // @todo: flag
  <Base
    onClick={() => openExternal(I18N_WEBSITE)}
    className='powercord-badge-translator'
    tooltip={Messages.POWERCORD_BADGES_TRANSLATOR}
    color={color}
  >
    <BadgeIcons.Translator/>
  </Base>
));

const BugHunter = React.memo(({ color }) => (
  <Base
    onClick={() => openExternal(`https://github.com/${REPO_URL}/issues?q=label:bug`)}
    className='powercord-badge-hunter'
    tooltip={Messages.POWERCORD_BADGES_HUNTER}
    color={color}
  >
    <BadgeIcons.Hunter/>
  </Base>
));

const EarlyUser = React.memo(({ color }) => (
  <Base
    className='powercord-badge-early'
    tooltip={Messages.POWERCORD_BADGES_EARLY}
    color={color}
  >
    <BadgeIcons.Early/>
  </Base>
));

module.exports = {
  Custom,
  Developer,
  Staff,
  Support,
  Contributor,
  Translator,
  BugHunter,
  EarlyUser
};
