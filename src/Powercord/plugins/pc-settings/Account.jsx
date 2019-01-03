const { React } = require('powercord/webpack');
const { Spinner } = require('powercord/components');

module.exports = class Account extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      token: null,
      linking: false,
      window: null
    };
  }

  render () {
    let Component = null;
    if (this.state.linking) {
      Component = () => <div><Spinner type='pulsingEllipsis'/> Linking your Powercord account...</div>;
    } else if (powercord.account) {
      Component = () => 'owo';
    } else {
      Component = () => <div>
        You haven't linked your Powercord account. <a href='#'>Not available yet</a>
        {/* <a href='#' onClick={() => this.link()}>Link it now</a> */}
      </div>;
    }

    return <div className='powercord-account'>
      <Component/>
    </div>;
  }

  processTokenMessage (msg) {
    console.log(msg);
  }

  link () {
    this.setState({ linking: true });
    // open DMs and send message
  }
};
