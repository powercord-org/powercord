const { React } = require('powercord/webpack');

const ConnectedAccount = require('./ConnectedAccount');
const accountStore = {};

module.exports = class ProfileConnections extends React.PureComponent {
  constructor (props) {
    super(props);

    this.state = accountStore[props.id] || {};
  }

  componentDidMount () {
    powercord.api.connections.fetchAccounts(this.props.id).then(accounts => {
      this.setState(accounts);
      accountStore[this.props.id] = accounts;
    });
  }

  render () {
    return [
      Object.values(this.state).map(account => account && <ConnectedAccount
        id={this.props.id}
        account={account}
      />)
    ];
  }
};
