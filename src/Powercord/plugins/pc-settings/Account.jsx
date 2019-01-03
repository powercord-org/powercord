const { remote } = require('electron');
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
    return <div className='powercord-account'>
      {this.state.linking
        ? <div><Spinner type='pulsingEllipsis'/> Linking your Powercord account...</div>
        : (powercord.account
          ? 'owo'
          : <div>
            You haven't linked your Powercord account. <a href='#'>Not available yet</a>{/* <a href='#' onClick={() => this.link()}>Link it now</a> */}
          </div>)}
    </div>;
  }

  link () {
    if (!this.state.window) {
      const externalWindow = new remote.BrowserWindow({
        width: 800,
        height: 600,
        parent: remote.getCurrentWindow()
      });

      this.setState({
        linking: true,
        window: externalWindow
      });

      const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
      externalWindow.loadURL(`${baseUrl}/oauth/discord`);

      externalWindow.webContents.on('will-navigate', (event, url) => {
        console.log(url);
      });

      externalWindow.once('close', async () => {
        await powercord.fetchAccount();
        this.setState({
          window: null,
          linking: false
        });
      });

    }
  }
};
