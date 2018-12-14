const Plugin = require('powercord/Plugin');
const { join } = require('path');
const { get } = require('powercord/http');
const { sleep } = require('powercord/util');

const { remote: { dialog } } = require('electron');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const REPO = 'aetheryx/powercord';

module.exports = class Updater extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [ 'webpack' ],
      appMode: 'app'
    });

    this.gitDir = join(__dirname, ...Array(3).fill('..'), '.git');
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

    setTimeout(() => {
      this.askUpdate();
    }, 1500);
    return;

    const branch = await exec(`git --git-dir="${this.gitDir}" branch`)
      .then(({ stdout }) =>
        stdout
          .toString()
          .split('\n')
          .find(l => l.startsWith('*'))
          .slice(2)
          .trim()
      );

    const localRevision = await exec(`git --git-dir="${this.gitDir}" rev-parse ${branch}`)
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
    const { ReactDOM, React } = require('powercord/webpack');
    const { Toast } = require('powercord/components');

    const container = document.createElement('div');
    document.body.appendChild(container);

    ReactDOM.render(
      React.createElement(Toast, {
        style: {
          bottom: '15px',
          right: '15px',
          height: '90px',
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
      .then(() => sleep(100))
      .then(() => setState({
        buttons: [],
        content: 'Updating...'
      }))
      .then(() => setState({ fade: 'in' }))
      .then(() => new Promise(resolve => {}));
      // .then(() => sleep(2000))
      // .then(() => Promise.reject())
      // .then(() =>
      //   setState({ fade: 'out' })
      //     .then(() => sleep(100))
      //     .then(() => setState({ content: 'Done!' }))
      //     .then(() => setState({ fade: 'in' }))
      //     .then(() => sleep(1000))
      //     .then(() => setState({ leaving: true }))
      //     .then(() => sleep(500))
      //     .then(() => true)
      // )
      // .catch(() => new Promise(resolve =>
      //   setState({ fade: 'out' })
      //     .then(() => sleep(100))
      //     .then(() => setState({
      //       content: 'The update failed..',
      //       buttons: [ {
      //         text: 'Okay :(',
      //         onClick: () =>
      //           setState({ leaving: true })
      //             .then(() => sleep(500))
      //             .then(() => resolve(this.ask = false))
      //       } ]
      //     }))
      //     .then(() => setState({ fade: 'in' }))
      // ));

      return exec(`git --git-dir="${this.gitDir}" --work-tree="${join(this.gitDir, '..')}" pull`)
      .catch(e => {
        dialog.showMessageBox({
          type: 'error',
          title: 'Powercord Updater',
          message: 'Powercord failed to update. You have to resolve this manually.',
          detail: e.stderr.replace(/\t/g, ' '.repeat(4))
        });

        this.ask = false;

        return false;
      });
  }

  reboot (updateWasSuccess) {
    if (!updateWasSuccess) {
      return;
    }

    location.reload();
  }
};
