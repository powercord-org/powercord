const { shell: { openExternal } } = require('electron');
const { get } = require('powercord/http');
const { WEBSITE, REPO_URL } = require('powercord/constants');
const { open: openModal } = require('powercord/modal');
const { Clickable, Tooltip } = require('powercord/components');
const { React, getModule, constants: { Routes } } = require('powercord/webpack');
const { GUILD_ID, DISCORD_INVITE, I18N_WEBSITE } = require('powercord/constants');

const DonateModal = require('./DonateModal');
const Badge = require('./Badge');

const badgesStore = {};
const badges = {
  developer: () => openExternal(`${WEBSITE}/contributors`),
  staff: async () => {
    const store = await getModule([ 'getGuilds' ]);
    if (store.getGuilds()[GUILD_ID]) {
      const router = await getModule([ 'transitionTo' ]);
      const channel = await getModule([ 'getLastSelectedChannelId' ]);
      const userProfileModal = await getModule([ 'fetchProfile' ]);
      // eslint-disable-next-line new-cap
      router.transitionTo(Routes.CHANNEL(GUILD_ID, channel.getChannelId(GUILD_ID)));
      userProfileModal.close();
    } else {
      const windowManager = await getModule([ 'flashFrame', 'minimize' ]);
      const { INVITE_BROWSER: { handler: popInvite } } = await getModule([ 'INVITE_BROWSER' ]);
      const oldMinimize = windowManager.minimize;
      windowManager.minimize = () => void 0;
      popInvite({ args: { code: DISCORD_INVITE } });
      windowManager.minimize = oldMinimize;
    }
  },
  contributor: () => openExternal(`${WEBSITE}/contributors`),
  translator: () => openExternal(I18N_WEBSITE),
  hunter: () => openExternal(`https://github.com/${REPO_URL}/issues?q=label:bug`),
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
