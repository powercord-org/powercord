const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { WEBSITE } = require('powercord/constants');
const { Icon } = require('powercord/components');
const { get } = require('powercord/http');

const Verified = require('./Verified');
const store = {};

let components, classes;
setImmediate(async () => {
  components = { Flex: await getModuleByDisplayName('Flex') };
  classes = { ...await getModule([ 'headerInfo' ]) };
});

module.exports = class ProfileConnection extends React.Component {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.type);
    this.state = store[props.id] || {};
  }

  async componentDidMount () {
    // Fetch even if the store is populated, to update cached stuff
    if (this.props.type === 'github' && this.props.id) {
      try {
        const baseUrl = powercord.settings.get('backendURL', WEBSITE);
        const { connections } = await get(`${baseUrl}/api/v2/users/${this.props.id}`).then(res => res.body);
        this.setState(connections);
        store[this.props.id] = connections;
      } catch (e) {
        // Let it fail silently, probably just 404
      }
    }
  }

  render () {
    if (!this.connection || (this.props.type === 'github' && !this.state.github)) {
      return null;
    }

    const { Flex } = components;
    const { connection } = this;

    return <Flex align={Flex.Align.CENTER} grow={0} className={classes.connectedAccount}>
      <img
        alt={Messages.IMG_ALT_LOGO.format({ name: connection.name })}
        className={classes.connectedAccountIcon}
        src={connection.icon.color}
      />
      <div className={classes.connectedAccountNameInner}>
        <div className={classes.connectedAccountName}>{this.props.type === 'github'
          ? this.state.github.display || this.state.github.login
          : this.props.name}
        </div>
        {this.props.verified &&
          <Verified className={classes.connectedAccountVerifiedIcon}/>
        }
      </div>
      {typeof connection.getPlatformUserUrl === 'function' &&
        <a href={connection.getPlatformUserUrl(this.props.type === 'github' ? this.state.github.login : this.props.id)} target='_blank'>
          <Icon name='Nova_Launch' className={classes.connectedAccountOpenIcon}/>
        </a>
      }
    </Flex>;
  }
};
