const { React } = require('powercord/webpack');
const { BadgeTooltips } = require('powercord/constants');
const { Tooltip, Icons: { badges } } = require('powercord/components');

module.exports = ({ badge, color }) => {
  const Badge = badges[badge[0].toUpperCase() + badge.toLowerCase().slice(1)];

  return (
    <Tooltip text={BadgeTooltips[badge.toUpperCase()]} position='top'>
      <div className={`powercord-badge ${badge}`}>
        <Badge style={{ '--badge-color': `#${color}` }}/>
      </div>
    </Tooltip>
  );
};
