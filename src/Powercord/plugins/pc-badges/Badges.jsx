const { get } = require('powercord/http');
const { React } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');

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
    if (!badgesStore[this.props.id]) {
      try {
        const baseUrl = powercord.settings.get('backendURL', WEBSITE);
        const badges = await get(`${baseUrl}/api/users/${this.props.id}`).then(res => res.body);
        this.setState(badges);
        badgesStore[this.props.id] = badges;
      } catch (e) {
        // Let it fail silently, probably just 404
      }
    }
  }

  render () {
    return Object.entries(this.state)
      .map(([ badgeName, hasBadge ]) => (
        hasBadge && badges.includes(badgeName) &&
        <Badge
          badge={badgeName} key={badgeName}
          color={this.state.customization && this.state.customization.color ? this.state.customization.color : '7289DA'}
        />
      ));
  }
};
