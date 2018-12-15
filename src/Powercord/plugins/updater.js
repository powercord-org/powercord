const Plugin = require('powercord/Plugin');
const { join } = require('path');
const { get } = require('powercord/http');
const { sleep } = require('powercord/util');
const { ReactDOM, React } = require('powercord/webpack');
const { Toast } = require('powercord/components');

const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const REPO = 'aetheryx/powercord';

module.exports = class Updater extends Plugin {
  constructor () {
    super();

    this.cwd = {
      cwd: join(__dirname, ...Array(3).fill('..'))
    };
    this.ask = true;
  }

  async start () {
    setInterval(this.checkForUpdate.bind(this), 15 * 60 * 1000);
    this.checkForUpdate();
  }

  async checkForUpdate () {
    if (!this.ask) {
      return;
    }

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

    const currentRevision = await get(`https://api.github.com/repos/${REPO}/commits`)
      .set('Accept', 'application/vnd.github.v3+json')
      .query('sha', branch)
      .then(r => r.body[0].sha);

    if (localRevision !== currentRevision) {
      this.askUpdate();
    }
  }

  askUpdate () {
    const container = document.createElement('div');
    document.body.appendChild(container);

    ReactDOM.render(
      React.createElement(Toast, {
        style: {
          bottom: '25px',
          right: '25px',
          height: '95px',
          width: '300px'
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
          text: 'Don\'t ask me again',
          onClick: (setState) =>
            setState({ leaving: true })
              .then(() => sleep(500))
              .then(() => container.remove())
              .then(() => (this.ask = false))
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
      .catch(() => new Promise(resolve =>
        setState({ fade: 'out' })
          .then(() => setState({
            content: 'Something went wrong, please update manually.',
            buttons: [ {
              text: 'Okay :(',
              onClick: () =>
                setState({ leaving: true })
                  .then(() => resolve(this.ask = false))
            } ]
          }))
          .then(() => setState({ fade: 'in' }))
      ));
  }
};
