const Plugin = require('powercord/Plugin');
const { join } = require('path');
const { get } = require('powercord/http');
const { remote: { dialog } } = require('electron');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const REPO = 'aetheryx/powercord';

module.exports = class Updater extends Plugin {
  constructor () {
    super({
      stage: 2,
      dependencies: [],
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
    dialog.showMessageBox({
      type: 'question', 
      title: 'Powercord Updater',
      message: 'Hey cutie! Powercord has an update.',
      detail: 'What do you want to do?',
      buttons: [
        'Update',
        'Update and reboot Discord',
        'Don\'t update',
        'Don\'t update and don\'t ask me until next boot'
      ],
      defaultId: 3,
    }, (key) => {
      switch (key) {
        case 0:
          return this.update();
        
        case 1:
          return this.update().then(this.reboot);
        
        case 2:
          return;

        case 3:
          this.ask = false;
          return;
      }
    });
  }

  update () {
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
