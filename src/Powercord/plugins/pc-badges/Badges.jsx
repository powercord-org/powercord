const { get } = require('powercord/http');
const { React } = require('powercord/webpack');

const Badge = require('./Badge.jsx');

const badgesStore = {};

module.exports = class Badges extends React.Component {
  async componentDidMount () {
    if (this.userID !== this.props.user.id) {
      this.badges = null;
      this.userID = this.props.user.id;
      if (!badgesStore[this.userID]) {
        try {
          const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
          badgesStore[this.userID] = await get(`${baseUrl}/api/users/${this.userID}`).then(res => res.body);
        } catch (e) {
          // Let it fail silently, probably just 404
        }
      }

      this.badges = badgesStore[this.userID];
      this.forceUpdate();
    }
  }

  render () {
    return <>
      {this.badges && this.badges.developer && <Badge badge='developer'/>}
      {this.badges && this.badges.contributor && <Badge badge='contributor'/>}
      {this.badges && this.badges.hunter && <Badge badge='hunter'/>}
      {this.badges && this.badges.tester && <Badge badge='tester'/>}
    </>;
  }
};
