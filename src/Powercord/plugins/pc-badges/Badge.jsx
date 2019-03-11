const { React } = require('powercord/webpack');
const { BadgeTooltips } = require('powercord/constants');
const { Tooltip } = require('powercord/components');

module.exports = ({ badge }) => {
  const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
  return (
    <Tooltip text={BadgeTooltips[badge.toUpperCase()]} position='top'>
      <div className={`powercord-badge ${badge}`}>
        <img src={`${baseUrl}/assets/badges/${badge}.svg`} alt={BadgeTooltips[badge]} />
      </div>
    </Tooltip>
  );
};
