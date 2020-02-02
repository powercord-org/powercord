const { React, getModule, getModuleByDisplayName, modal, i18n: { Messages } } = require('powercord/webpack');
const { AsyncComponent, Clickable } = require('powercord/components');

const Alert = AsyncComponent.from(getModuleByDisplayName('Alert'));
const FormText = AsyncComponent.from(getModuleByDisplayName('FormText'));

module.exports = class SettingsConnection extends React.PureComponent {
  constructor (props) {
    super(props);

    this.connection = powercord.api.connections.get(props.account.type);
    this.state = {
      classes: null
    };
  }

  async componentDidMount () {
    this.setState({
      classes: { ...await getModule([ 'connection', 'integration' ]) }
    });
  }

  handleDisconnect () {
    const { connection, props: { onDisconnect } } = this;

    modal.push(class ConnectionDisconnect extends React.Component {
      render () {
        return React.createElement(Alert, {
          title: Messages.DISCONNECT_ACCOUNT_TITLE.format({ name: connection.name }),
          body: Messages.DISCONNECT_ACCOUNT_BODY,
          confirmText: Messages.DISCONNECT_ACCOUNT,
          cancelText: Messages.CANCEL,
          onConfirm: onDisconnect,
          onCancel: modal.pop
        });
      }
    });
  }

  renderHeader () {
    const { connection, state: { classes }, props: { account } } = this;

    return <div className={classes.connectionHeader}>
      <img alt={connection.name} className={classes.connectionIcon} src={connection.icon.white}/>
      <div>
        <FormText className={classes.connectionAccountValue}>{account.name}</FormText>
        <FormText
          className={classes.connectionAccountLabel}
          style={{ color: '#fff' }}
          type='description'
        >
          {Messages.ACCOUNT_NAME}
        </FormText>
        <Clickable className={classes.connectionDelete} onClick={this.handleDisconnect.bind(this)}>
          {Messages.SERVICE_CONNECTIONS_DISCONNECT}
        </Clickable>
      </div>
    </div>;
  }

  render () {
    if (!this.connection || !this.state.classes) {
      return null;
    }

    const { connection, state: { classes } } = this;

    return <div className={classes.connection} style={{ borderColor: connection.color,
      backgroundColor: connection.color
    }}>
      {this.renderHeader()}
    </div>;
  }
};
