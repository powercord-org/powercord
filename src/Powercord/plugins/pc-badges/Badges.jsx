const { get } = require('powercord/http');
const { React } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { Tooltip } = require('powercord/components');

const Badge = require('./Badge.jsx');

const badgesStore = {};
const badges = [ 'developer', 'staff', 'contributor', 'early', 'hunter' ];

module.exports = class Badges extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = badgesStore[props.id] || {};
  }

  async componentDidMount () {
    // Fetch even if the store is populated, to update cached stuff
    try {
      const baseUrl = powercord.settings.get('backendURL', WEBSITE);
      const { badges } = await get(`${baseUrl}/api/v2/users/${this.props.id}`).then(res => res.body);
      this.setState(badges);
      badgesStore[this.props.id] = badges;
    } catch (e) {
      // Let it fail silently, probably just 404
    }
  }

  render () {
    return [
      this.state.custom &&
      <Tooltip text={this.state.custom.name} position='top'>
        <div className='powercord-badge donor' style={{
          '--custom': `url('${this.state.custom.icon}')`,
          '--custom-white': `url('${this.state.custom.white}')`,
          '--custom-name': `url('${this.state.custom.name}')`
        }}/>
      </Tooltip>,
      ...Object.entries(this.state)
        .map(([ badgeName, hasBadge ]) => (
          hasBadge && badges.includes(badgeName) &&
          <Badge
            badge={badgeName} key={badgeName}
            color={this.state.custom && this.state.custom.color ? this.state.custom.color : '7289DA'}
          />
        ))
    ];
  }
};
