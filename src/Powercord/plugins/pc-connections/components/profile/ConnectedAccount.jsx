const { React, getModule, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { ExternalLink } } = require('powercord/components');

const Verified = require('../Verified');

let components, classes;
setImmediate(async () => {
  components = { Flex: await getModuleByDisplayName('Flex') };
  classes = { ...await getModule([ 'connectedAccount', 'headerInfo' ]) };
});

module.exports = class ConnectedAccount extends React.Component {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.account.type);
  }

  render () {
    const { Flex } = components;
    const { props: { account }, connection } = this;

    return <Flex align={Flex.Align.CENTER} grow={0} className={classes.connectedAccount}>
      <img
        alt={Messages.IMG_ALT_LOGO.format({ name: connection.name })}
        className={classes.connectedAccountIcon}
        src={connection.icon.color}
      />
      <div className={classes.connectedAccountNameInner}>
        <div className={classes.connectedAccountName}>{account.name}
        </div>
        {account.verified &&
          <Verified className={classes.connectedAccountVerifiedIcon}/>
        }
      </div>
      {typeof connection.getPlatformUserUrl === 'function' &&
        <a href={connection.getPlatformUserUrl(account)} target='_blank'>
          <ExternalLink className={classes.connectedAccountOpenIcon}/>
        </a>
      }
    </Flex>;
  }
};
