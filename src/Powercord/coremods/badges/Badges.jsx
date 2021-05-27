/**
 * Copyright (c) 2018-2020 aetheryx & Bowser65
 * All Rights Reserved. Licensed under the Porkord License
 * https://powercord.dev/porkord-license
 */

const {
    shell: { openExternal }
} = require("electron");
const { open: openModal } = require("powercord/modal");
const { gotoOrJoinServer } = require("powercord/util");
const {
    Clickable,
    Tooltip,
    Icons: { badges: BadgeIcons }
} = require("powercord/components");
const {
    React,
    getModule,
    i18n: { Messages }
} = require("powercord/webpack");
const { WEBSITE, I18N_WEBSITE, DISCORD_INVITE, REPO_URL } = require("powercord/constants");
const DonateModal = require("./DonateModal");

const Base = React.memo(({ color, tooltip, tooltipPosition, onClick, className, children, isPopOut }) => {
    const { profileBadge24 } = getModule(["profileBadge24"], false);
    const { profileBadge18 } = getModule(["profileBadge18"], false);
    return (
        <Tooltip text={tooltip} position={tooltipPosition || "top"}>
            <Clickable onClick={onClick || (() => void 0)}>
                <div className={`${isPopOut ? profileBadge18 : profileBadge24} powercord-badge ${className}`} style={{ color: `#${color || "7289da"}` }}>
                    {children}
                </div>
            </Clickable>
        </Tooltip>
    );
});

const Custom = React.memo(({ name, icon, white, tooltipPosition, isPopOut }) => (
    <Base tooltipPosition={tooltipPosition} onClick={() => openModal(DonateModal)} className="powercord-badge-cutie" tooltip={name} isPopOut={isPopOut}>
        <img src={icon} alt="Custom badge" />
        {white && <img src={white} alt="Custom badge" />}
    </Base>
));

const Developer = React.memo(({ color, isPopOut }) => (
    <Base onClick={() => openExternal(`${WEBSITE}/contributors`)} className="powercord-badge-developer" tooltip={Messages.POWERCORD_BADGES_DEVELOPER} color={color} isPopOut={isPopOut}>
        <BadgeIcons.Developer />
    </Base>
));

const Staff = React.memo(({ color, isPopOut }) => (
    <Base onClick={() => gotoOrJoinServer(DISCORD_INVITE)} className="powercord-badge-staff" tooltip={Messages.POWERCORD_BADGES_STAFF} color={color} isPopOut={isPopOut}>
        <BadgeIcons.Staff />
    </Base>
));

const Support = React.memo(({ color, isPopOut }) => (
    <Base onClick={() => gotoOrJoinServer(DISCORD_INVITE)} className="powercord-badge-support" tooltip={Messages.POWERCORD_BADGES_SUPPORT} color={color} isPopOut={isPopOut}>
        <BadgeIcons.Support />
    </Base>
));

const Contributor = React.memo(({ color, isPopOut }) => (
    <Base onClick={() => openExternal(`${WEBSITE}/contributors`)} className="powercord-badge-contributor" tooltip={Messages.POWERCORD_BADGES_CONTRIBUTOR} color={color} isPopOut={isPopOut}>
        <BadgeIcons.Contributor />
    </Base>
));

const Translator = React.memo(
    (
        { color, isPopOut } // @todo: flag
    ) => (
        <Base onClick={() => openExternal(I18N_WEBSITE)} className="powercord-badge-translator" tooltip={Messages.POWERCORD_BADGES_TRANSLATOR} color={color} isPopOut={isPopOut}>
            <BadgeIcons.Translator />
        </Base>
    )
);

const BugHunter = React.memo(({ color, isPopOut }) => (
    <Base
        onClick={() => openExternal(`https://github.com/${REPO_URL}/issues?q=label:bug`)}
        className="powercord-badge-hunter"
        tooltip={Messages.POWERCORD_BADGES_HUNTER}
        color={color}
        isPopOut={isPopOut}
    >
        <BadgeIcons.Hunter />
    </Base>
));

const EarlyUser = React.memo(({ color, isPopOut }) => (
    <Base className="powercord-badge-early" tooltip={Messages.POWERCORD_BADGES_EARLY} color={color} isPopOut={isPopOut}>
        <BadgeIcons.Early />
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
