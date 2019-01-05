const { React } = require('powercord/webpack');
const { Tooltip } = require('powercord/components');

const tooltips = {
  developer: 'Powercord Developer',
  contributor: 'Powercord Contributor',
  tester: 'Powercord Beta Tester',
  hunter: 'Powercord Bug Hunter'
};

module.exports = class Badge extends React.Component {
  render () {
    const { badge } = this.props;
    const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
    return <Tooltip text={tooltips[badge]} position='top'>
      <div className={`powercord-badge ${badge}`}>
        <img src={`${baseUrl}/assets/badges/${badge}.svg`} alt={tooltips[badge]}/>
      </div>
    </Tooltip>;
  }
};
