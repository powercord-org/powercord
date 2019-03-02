const Plugin = require('powercord/Plugin');
const { resolve, join } = require('path');
const { get } = require('powercord/http');
const { sleep, createElement } = require('powercord/util');
const { ReactDOM, React } = require('powercord/webpack');
const { Toast } = require('powercord/components');
const { REPO_URL } = require('powercord/constants');

const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const Settings = require('./Settings.jsx');

module.exports = class Updater extends Plugin {
  constructor () {
    super();

    this.checking = false;
    this.cwd = {
      cwd: join(__dirname, ...Array(3).fill('..'))
    };
  }

  async start () {
    this.loadCSS(resolve(__dirname, 'style.scss'));
    powercord
      .pluginManager
      .get('pc-settings')
      .register('pc-updater', 'Updater', () =>
        React.createElement(Settings, {
          settings: this.settings
        })
      );

    let minutes = Number(this.settings.get('interval', 15));
    if (minutes < 1) {
      this.settings.set('interval', 1);
      minutes = 1;
    }

    this._interval = setInterval(this.checkForUpdate.bind(this), minutes * 60 * 1000);
    this.checkForUpdate();
  }

  unload () {
    this.unloadCSS();
    clearInterval(this._interval);
    powercord
      .pluginManager
      .get('pc-settings')
      .unregister('pc-updater');
  }

  async checkForUpdate (callback) {
    if (!this.settings.get('checkForUpdates', true)) {
      return;
    }

    this.checking = true;

    const branch = await exec('git branch', this.cwd)
      .then(({ stdout }) =>
        stdout
          .toString()
          .split('\n')
          .find(l => l.startsWith('*'))
          .slice(2)
          .trim()
      );

    const localRevision = await exec(`git rev-parse ${branch}`, this.cwd)
      .then(r => r.stdout.toString().trim());

    const currentRevision = await get(`https://api.github.com/repos/${REPO_URL}/commits`)
      .set('Accept', 'application/vnd.github.v3+json')
      .query('sha', branch)
      .then(r => r.body[0].sha);

    if (localRevision !== currentRevision) {
      this.askUpdate();
    }

    this.checking = false;
    if (callback) {
      return callback();
    }
  }

  askUpdate () {
    if (document.getElementById('powercord-updater')) {
      return;
    }

    const container = createElement('div', { id: 'powercord-updater' });
    document.body.appendChild(container);

    ReactDOM.render(
      React.createElement(Toast, {
        style: {
          bottom: '25px',
          right: '25px',
          height: '95px',
          width: '320px'
        },
        header: 'Powercord has an update.',
        buttons: [ {
          text: 'Update',
          onClick: (setState) =>
            this.update(setState)
              .then(() => container.remove())
        }, {
          text: 'Update and reboot',
          onClick: (setState) =>
            this.update(setState)
              .then(success =>
                success
                  ? location.reload()
                  : container.remove()
              )
        }, {
          text: 'Don\'t update',
          onClick: (setState) =>
            setState({ leaving: true })
              .then(() => sleep(500))
              .then(() => container.remove())
        }, {
          text: 'Never ask me again',
          onClick: (setState) =>
            setState({ leaving: true })
              .then(() => sleep(500))
              .then(() => container.remove())
              .then(() => this.settings.set('checkForUpdates', false))
        } ]
      }),
      container
    );
  }

  update (setState) {
    return setState({ fade: 'out' })
      .then(() => setState({
        buttons: [],
        content: 'Updating...'
      }))
      .then(() => setState({ fade: 'in' }))
      .then(() => exec('git pull', this.cwd))
      .then(() => exec('npm install --only=prod', this.cwd))
      .then(() =>
        setState({ fade: 'out' })
          .then(() => setState({ content: 'Done!' }))
          .then(() => setState({ fade: 'in' }))
          .then(() => sleep(1000))
          .then(() => setState({ leaving: true }))
          .then(() => true)
      )
      .catch(e => new Promise(res => {
        console.error(e);

        setState({ fade: 'out' })
          .then(() => setState({
            content: 'Something went wrong, please update manually.',
            buttons: [ {
              text: 'Okay :(',
              onClick: () =>
                setState({ leaving: true })
                  .then(() => res(this.ask = false))
            } ]
          }))
          .then(() => setState({ fade: 'in' }));
      }));
  }
};
