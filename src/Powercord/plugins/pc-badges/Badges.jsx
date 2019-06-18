const { get } = require('powercord/http');
const { React } = require('powercord/webpack');
const { BadgeTooltips, WEBSITE } = require('powercord/constants');
const { Tooltip, Icons: { badges: { DonorDefault } } } = require('powercord/components');

const Badge = require('./Badge.jsx');

const badgesStore = {};
const badges = [ 'developer', 'contributor', 'early', 'hunter', 'tester' ];

module.exports = class Badges extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = badgesStore[props.id] || {
      developer: false,
      contributor: false,
      early: false,
      hunter: false,
      tester: false,
      customization: null
    };
  }

  async componentDidMount () {
    // Fetch even if the store is populated, to update cached stuff
    try {
      const baseUrl = powercord.settings.get('backendURL', WEBSITE);
      const badges = await get(`${baseUrl}/api/users/${this.props.id}`).then(res => res.body);
      this.setState(badges);
      badgesStore[this.props.id] = badges;
    } catch (e) {
      // Let it fail silently, probably just 404
    }
  }

  render () {
    return [
      this.state.customization && this.state.customization.displayBadge &&
      <Tooltip text={this.state.customization.name || BadgeTooltips.DONOR} position='top'>
        <div className='powercord-badge donor' style={{
          '--custom': `url('${this.state.customization.custom}')`,
          '--custom-white': `url('${this.state.customization.customWhite}')`,
          '--custom-name': `url('${this.state.customization.name}')`
        }}>
          {!this.state.customization.custom && <DonorDefault/>}
        </div>
      </Tooltip>,
      ...Object.entries(this.state)
        .map(([ badgeName, hasBadge ]) => (
          hasBadge && badges.includes(badgeName) &&
          <Badge
            badge={badgeName} key={badgeName}
            color={this.state.customization && this.state.customization.color ? this.state.customization.color : '7289DA'}
          />
        ))
    ];
  }
};
