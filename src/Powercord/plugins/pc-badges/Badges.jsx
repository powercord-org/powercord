const { shell: { openExternal } } = require('electron');
const { get } = require('powercord/http');
const { React } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { open: openModal } = require('powercord/modal');
const { Clickable, Tooltip } = require('powercord/components');

const DonateModal = require('./DonateModal');
const Badge = require('./Badge');

const badgesStore = {};
const badges = {
  developer: () => openExternal(`${WEBSITE}/contributors`),
  staff: () => void 0,
  contributor: () => openExternal(`${WEBSITE}/contributors`),
  hunter: () => openExternal('https://github.com/powercord-org/powercord/issues'),
  early: () => void 0
};

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
      this.state.custom && this.state.custom.icon && this.state.custom.name &&
      <Tooltip text={this.state.custom.name} position='top'>
        <Clickable onClick={() => openModal(DonateModal)} className='powercord-badge donor' style={{
          '--custom': `url('${this.state.custom.icon}')`,
          '--custom-white': `url('${this.state.custom.white}')`,
          '--custom-name': `url('${this.state.custom.name}')`
        }}/>
      </Tooltip>,
      Object.keys(badges).map(badge => this.state[badge] && <Badge
        badge={badge} key={badge} onClick={badges[badge]}
        color={this.state.custom && this.state.custom.color ? this.state.custom.color : '7289DA'}
      />)
    ];
  }
};
