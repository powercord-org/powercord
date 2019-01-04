const http = require('http');
const { shell: { openExternal } } = require('electron');
const { React } = require('powercord/webpack');
const { Spinner } = require('powercord/components');

module.exports = class Account extends React.Component {
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
    const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');

    let Component = null;
    if (this.state.linking) {
      Component = () => <div><Spinner type='pulsingEllipsis'/> Linking your Powercord account...</div>;
    } else if (powercord.account) {
      Component = () => <div>
        <img src={`${baseUrl}/assets/spotify.png`} alt='Spotify'/>
        <span>
          {powercord.account.spotify
            ? powercord.account.spotify.name
            : <a href='#' onClick={() => openExternal(`${baseUrl}/oauth/spotify`)}>Link it now</a>}
        </span>
        <img src={`${baseUrl}/assets/github.png`} alt='Github'/>
        <span>
          {powercord.account.github
            ? powercord.account.github.name
            : <a href='#' onClick={() => openExternal(`${baseUrl}/oauth/github`)}>Link it now</a>}
        </span>
        <a href='#' onClick={() => this.refresh()}>Refresh accounts</a>
      </div>;
    } else {
      Component = () => <div>
        {this.state.message || 'You haven\'t linked your Powercord account.'}
        <a href='#' onClick={() => this.link()}>Link it now</a>
      </div>;
    }

    return <div className='powercord-account'>
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
    this.forceUpdate();
  }

  link () {
    const server = http.createServer({}, async (req, res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Headers', 'x-powercord-token');
      if (req.method === 'GET' && req.headers['x-powercord-token']) {
        res.end('thx cutie');
        server.close();

        clearTimeout(this.state.timeout);
        powercord.settings.set('powercordToken', req.headers['x-powercord-token']);
        await powercord.fetchAccount();
        this.setState({
          linking: false,
          server: null,
          timeout: null
        });
      }
      res.end('hi cutie');
    });

    server.listen(6462, (err) => {
      if (err) {
        this.setState({
          linking: false,
          server: null,
          message: 'An error occurred. Check console for more details'
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
