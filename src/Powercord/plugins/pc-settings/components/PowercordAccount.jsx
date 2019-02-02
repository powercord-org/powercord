const http = require('http');
const { shell: { openExternal } } = require('electron');

const { React, Flux } = require('powercord/webpack');
const { Spinner } = require('powercord/components');

const LinkedAccounts = require('./LinkedAccounts.jsx');

const PowercordAccount = class PowercordAccount extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      linking: false,
      message: null,
      server: null,
      timeout: null
    };
  }

  render () {
    let Component = null;
    if (this.props.streamerMode.enabled && this.props.streamerMode.hidePersonalInformation) {
      Component = () => <div>Streamer mode enabled. Stay safe cutie!</div>;
    } else if (this.state.linking) {
      Component = () => <div className='linking'><Spinner type='pulsingEllipsis'/> Linking your account...</div>;
    } else if (powercord.account) {
      Component = () => <LinkedAccounts
        passphrase={this.props.passphrase.bind(this)}
        refresh={this.refresh.bind(this)}
        unlink={this.unlink.bind(this)}
      />;
    } else {
      Component = () => <div>
        {this.state.message || 'You haven\'t linked your account yet.'}
        <a href='#' onClick={() => this.link()}>Link it now</a>
      </div>;
    }

    return <div className='powercord-account'>
      <div className='powercord-title'>Powercord Account</div>
      <Component/>
    </div>;
  }

  componentWillUnmount () {
    if (this.state.server) {
      this.state.server.close();
      clearTimeout(this.state.timeout);
    }
  }

  async refresh () {
    await powercord.fetchAccount();
    this.props.onAccount();
  }

  async unlink () {
    powercord.settings.set('powercordToken', null);
    await powercord.fetchAccount();
    this.props.onAccount();
  }

  link () {
    const _url = '/wallpaper.png?jsonweebtoken=';
    const server = http.createServer({}, async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', '*');
      if (req.method === 'GET') {
        if (req.url.startsWith(_url)) {
          res.end('thx cutie');
          server.close();

          clearTimeout(this.state.timeout);
          powercord.settings.set('powercordToken', req.url.replace(_url, ''));
          await powercord.fetchAccount();
          this.props.onAccount();
          return this.setState({
            linking: false,
            server: null,
            timeout: null
          });
        }
      }
      res.end('hi cutie');
    });

    server.listen(6462, (err) => {
      if (err) {
        this.setState({
          linking: false,
          server: null,
          message: 'An error occurred. Check console for more details!'
        });
        return console.error(err);
      }

      const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
      openExternal(`${baseUrl}/api/users/link`);

      const timeout = setTimeout(() => {
        this.state.server.close();
        this.setState({
          linking: false,
          server: null,
          message: 'Linking flow timed out :( Maybe try again?'
        });
      }, 30000);
      this.setState({ timeout });
    });

    this.setState({
      linking: true,
      server
    });
  }
};

const fluxShit = Object.values(require('powercord/webpack').instance.cache).filter(m => m.exports && m.exports.cacheKey && m.exports.cacheKey === 'StreamerModeStore')[0].exports;
module.exports = Flux.connectStores([ fluxShit ], () => ({ streamerMode: fluxShit.getSettings() }))(PowercordAccount);
