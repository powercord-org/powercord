const { React, getModule, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { ExternalLink } } = require('powercord/components');

const Verified = require('../Verified');

let classes;
setImmediate(async () => {
  classes = { ...await getModule([ 'connectedAccount' ]) };
});

module.exports = class ConnectedAccount extends React.Component {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.account.type);
  }

  render () {
    const { props: { account }, connection } = this;

    return <div className={classes.connectedAccount}>
      <img
        alt={Messages.IMG_ALT_LOGO.format({ name: connection.name })}
        className={classes.connectedAccountIcon}
        src={connection.icon.color}
      />
      <div className={classes.connectedAccountNameInner}>
        <div className={classes.connectedAccountName}>{account.name}
        </div>
        {account.verified && <Verified className={classes.connectedAccountVerifiedIcon}/>}
      </div>
      {typeof connection.getPlatformUserUrl === 'function' &&
        <a href={connection.getPlatformUserUrl(account)} target='_blank'>
          <ExternalLink className={classes.connectedAccountOpenIcon}/>
        </a>
      }
    </div>;
  }
};
