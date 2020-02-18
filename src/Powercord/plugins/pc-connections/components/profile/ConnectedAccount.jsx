const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Icon } = require('powercord/components');

const Verified = require('../Verified');

let components, classes;
setImmediate(async () => {
  components = { Flex: await getModuleByDisplayName('Flex') };
  classes = { ...await getModule([ 'headerInfo' ]) };
});

module.exports = class ConnectedAccount extends React.Component {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.type);
  }

  render () {
    const { Flex } = components;
    const { connection } = this;

    return <Flex align={Flex.Align.CENTER} grow={0} className={classes.connectedAccount}>
      <img
        alt={Messages.IMG_ALT_LOGO.format({ name: connection.name })}
        className={classes.connectedAccountIcon}
        src={connection.icon.color}
      />
      <div className={classes.connectedAccountNameInner}>
        <div className={classes.connectedAccountName}>{this.props.name}
        </div>
        {this.props.verified &&
          <Verified className={classes.connectedAccountVerifiedIcon}/>
        }
      </div>
      {typeof connection.getPlatformUserUrl === 'function' &&
        <a href={connection.getPlatformUserUrl(this.props)} target='_blank'>
          <Icon name='Nova_Launch' className={classes.connectedAccountOpenIcon}/>
        </a>
      }
    </Flex>;
  }
};
