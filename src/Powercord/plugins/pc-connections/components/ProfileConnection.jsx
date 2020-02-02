const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Icon } = require('powercord/components');

module.exports = class ProfileConnection extends React.Component {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.type);
    this.state = {
      components: null,
      classes: null
    };
  }

  async componentDidMount () {
    this.setState({
      components: { Flex: await getModuleByDisplayName('Flex') },
      classes: { ...await getModule([ 'headerInfo' ]) }
    });
  }

  render () {
    if (!this.connection || !this.state.classes) {
      return null;
    }

    const { connection, state: { components: { Flex }, classes } } = this;

    return <Flex align={Flex.Align.CENTER} grow={0} className={classes.connectedAccount}>
      <img
        alt={Messages.IMG_ALT_LOGO.format({ name: connection.name })}
        className={classes.connectedAccountIcon}
        src={connection.icon.color}
      />
      <div className={classes.connectedAccountNameInner}>
        <div className={classes.connectedAccountName}>{this.props.name}</div>
      </div>
      {connection.getPlatformUserUrl && connection.getPlatformUserUrl(this.props.id) &&
        <a href={connection.getPlatformUserUrl(this.props.id)} target='_blank'>
          <Icon name='Nova_Launch' className={classes.connectedAccountOpenIcon}></Icon>
        </a>
      }
    </Flex>;
  }
};
