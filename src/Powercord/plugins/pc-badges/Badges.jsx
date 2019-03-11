const { get } = require('powercord/http');
const { React } = require('powercord/webpack');

const Badge = require('./Badge.jsx');

const badgesStore = {};

module.exports = class Badges extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = badgesStore[props.id] || {
      developer: false,
      contributor: false,
      hunter: false,
      tester: false
    };
  }

  async componentDidMount () {
    if (!badgesStore[this.props.id]) {
      try {
        const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
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
        hasBadge && <Badge badge={badgeName} key={badgeName} />
      ));
  }
};
