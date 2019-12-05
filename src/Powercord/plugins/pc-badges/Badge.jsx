const { React } = require('powercord/webpack');
const { BadgeTooltips } = require('powercord/constants');
const { Clickable, Tooltip, Icons: { badges } } = require('powercord/components');

module.exports = ({ badge, color, onClick }) => {
  const Badge = badges[badge[0].toUpperCase() + badge.toLowerCase().slice(1)];

  return (
    <Tooltip text={BadgeTooltips[badge.toUpperCase()]} position='top'>
      <Clickable onClick={onClick} className={`powercord-badge ${badge}`}>
        <Badge style={{ '--badge-color': `#${color}` }}/>
      </Clickable>
    </Tooltip>
  );
};
