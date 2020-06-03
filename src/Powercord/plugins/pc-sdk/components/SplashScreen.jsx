const { join } = require('path');
const { format: formatUrl } = require('url');
const { remote: { BrowserWindow, app: remoteApp } } = require('electron');
const { React } = require('powercord/webpack');
const { Flex, Button } = require('powercord/components');

const SplashStages = Object.freeze({
  CHECKING_FOR_UPDATES: 'CHECKING_FOR_UPDATES',
  DOWNLOADING_UPDATES: 'DOWNLOADING_UPDATES',
  INSTALLING_UPDATES: 'INSTALLING_UPDATES',
  UPDATES_FAILED: 'UPDATES_FAILED',
  LUCKY_DAY: 'LUCKY_DAY',
  STARTING_UP: 'STARTING_UP'
});

class SplashScreen extends React.PureComponent {
  constructor (props) {
    super(props);
    this.state = {
      opened: false
    };
  }

  componentWillUnmount () {
    if (this.state.opened) {
      this.closeSplashScreen(true);
    }
  }

  render () {
    return (
      <div id='splash-screen' className='category'>
        <h2>Discord Splash Screen</h2>
        <p>
          Here, you can open a fake splash screen (with its developer tools) that will remain on-screen until closed. You can also manipulate
          its state to your likings and theme all parts of it without any trouble.
        </p>
        {this.state.opened ? this.renderOpened() : this.renderClosed()}
      </div>
    );
  }

  renderClosed () {
    return (
      <Button onClick={() => this.openSplashScreen()}>Open Splash Screen</Button>
    );
  }

  renderOpened () {
    return (
      <>
        <Flex className='splash-buttons' wrap={Flex.Wrap.WRAP}>
          <Button color={Button.Colors.YELLOW} onClick={() => this.closeSplashScreen(true) | this.openSplashScreen(true)}>
            Restart Splash Screen
          </Button>
          <Button color={Button.Colors.RED} onClick={() => this.closeSplashScreen()}>
            Close Splash Screen
          </Button>
        </Flex>
        <Flex className='splash-buttons' wrap={Flex.Wrap.WRAP}>
          <Button onClick={() => this.setSplashStage(SplashStages.CHECKING_FOR_UPDATES)}>
            Checking For Updates
          </Button>
          <Button onClick={() => this.setSplashStage(SplashStages.DOWNLOADING_UPDATES)}>
            Downloading Updates
          </Button>
          <Button onClick={() => this.setSplashStage(SplashStages.INSTALLING_UPDATES)}>
            Installing Updates
          </Button>
          <Button onClick={() => this.setSplashStage(SplashStages.UPDATES_FAILED)}>
            Updates Failed
          </Button>
          <Button onClick={() => this.setSplashStage(SplashStages.LUCKY_DAY)}>
            It's your lucky day!
          </Button>
          <Button onClick={() => this.setSplashStage(SplashStages.STARTING_UP)}>
            Starting Up
          </Button>
        </Flex>
      </>
    );
  }

  openSplashScreen (keepState) {
    const baseAsar = remoteApp.getAppPath();
    const splashIndex = formatUrl({
      protocol: 'file',
      slashes: true,
      pathname: join(baseAsar, 'app_bootstrap/splash/index.html')
    });
    const windowSettings = {
      /*
       * Here's a c/c of the comment I've found in Discord's src code regarding this:
       * - citron note: atom seems to add about 50px height to the frame on mac but not windows
       */
      height: process.platform === 'darwin' ? 300 : 350,
      width: 300,
      transparent: false,
      frame: false,
      resizable: false,
      center: true,
      show: true,
      webPreferences: {
        preload: join(__dirname, '../../../../preloadSplash.js'),
        nodeIntegration: true
      }
    };

    this._window = new BrowserWindow(windowSettings);
    this._window.loadURL(splashIndex);
    this._window.webContents.openDevTools({ mode: 'detach' });
    this._window.on('close', () => {
      if (!this._closeScheduled) {
        this.setState({ opened: false });
        delete this._window;
      }
    });

    if (!keepState) {
      this.setState({ opened: true });
    }
  }

  closeSplashScreen (keepState) {
    this._closeScheduled = true;
    this._window.close();
    delete this._window;
    setImmediate(() => (this._closeScheduled = false));
    if (!keepState) {
      this.setState({ opened: false });
    }
  }

  setSplashStage (stage) {
    const data = { status: 'checking-for-updates' };
    switch (stage) {
      case SplashStages.DOWNLOADING_UPDATES:
      case SplashStages.INSTALLING_UPDATES:
        data.status = stage === SplashStages.DOWNLOADING_UPDATES ? 'downloading-updates' : 'installing-updates';
        data.current = Math.floor(Math.random() * 4) + 1;
        data.total = Math.floor(Math.random() * 4) + 5;
        data.progress = Math.floor(Math.random() * 91) + 10;
        break;
      case SplashStages.UPDATES_FAILED:
        data.status = 'update-failure';
        data.seconds = Math.floor(Math.random() * 69) + 10;
        break;
      case SplashStages.LUCKY_DAY:
        data.status = 'update-manually';
        data.newVersion = '69.69.69';
        break;
      case SplashStages.STARTING_UP:
        data.status = 'launching';
        break;
    }
    this._window.webContents.send('DISCORD_SPLASH_UPDATE_STATE', data);
  }
}

module.exports = SplashScreen;
