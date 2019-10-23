const { Plugin } = require('powercord/entities');
const { resolve, join } = require('path');
const { sleep, createElement } = require('powercord/util');
const { ReactDOM, React } = require('powercord/webpack');
const { Toast } = require('powercord/components');

const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const Settings = require('./components/Settings.jsx');
const SettingsLegacy = require('./components/SettingsLegacy.jsx');

module.exports = class Updater extends Plugin {
  constructor () {
    super();

    this.checking = false;
    this.cwd = { cwd: join(__dirname, ...Array(4).fill('..')) };
  }

  async startPlugin () {
    if (this.settings.get('__experimental_20-10-19', false)) {
      this.settings.set('paused', false);
      this.settings.set('updating', false);
      this.settings.set('awaiting_reload', false);
      this.loadCSS(resolve(__dirname, 'style.scss'));
      this.registerSettings('pc-updater', 'Updater', Settings);

      let minutes = Number(this.settings.get('interval', 15));
      if (minutes < 1) {
        this.settings.set('interval', 1);
        minutes = 1;
      }

      /*
       * this._interval = setInterval(this.checkForUpdates.bind(this), minutes * 60 * 1000);
       * this.checkForUpdates();
       */
    } else {
      this.loadCSS(resolve(__dirname, 'styleLegacy.scss'));
      this.registerSettings('pc-updater', 'Updater', SettingsLegacy);

      let minutes = Number(this.settings.get('interval', 15));
      if (minutes < 1) {
        this.settings.set('interval', 1);
        minutes = 1;
      }

      this._interval = setInterval(this.checkForUpdateLegacy.bind(this), minutes * 60 * 1000);
      this.checkForUpdateLegacy();
    }
  }

  pluginWillUnload () {
    clearInterval(this._interval);
  }

  async checkForUpdates () {
    if (this.settings.set('checking', false) || this.settings.set('updating', false)) {
      return;
    }

    this.settings.set('checking', true);
    this.settings.set('checking_progress', [ 0, 0 ]);
    const disabled = this.settings.get('entities_disabled', []).map(e => e.id);
    const skipped = this.settings.get('entities_skipped', []);
    const plugins = [ ...powercord.pluginManager.plugins.values() ].filter(p => !p.isInternal);
    const themes = [ ...powercord.styleManager.themes.values() ].filter(t => t.isTheme);

    const entities = plugins.concat(themes).filter(e => !disabled.includes(e.updateIdentifier) && e.isUpdatable());
    if (!disabled.includes('powercord')) {
      entities.push(powercord);
    }

    // Not the prettiest way to limit concurrency but it works
    const groupedEntities = [];
    for (let i = 0; i < entities.length; i += 2) {
      groupedEntities.push([ entities[i], entities[i + 1] ]);
    }

    let done = 0;
    const updates = [];
    this.settings.set('checking_progress', [ 0, entities.length ]);
    for (const group of groupedEntities) {
      await Promise.all(group.filter(p => p).map(async entity => {
        const shouldUpdate = await entity.checkForUpdates();
        if (shouldUpdate) {
          const commits = await entity.getUpdateCommits();
          if (skipped[entity.updateIdentifier] === commits[0].id) {
            return;
          }
          updates.push({
            id: entity.updateIdentifier,
            name: entity.constructor.name,
            icon: entity.__proto__.__proto__.constructor.name.replace('Updatable', 'Powercord'),
            repo: await entity.getGitRepo(),
            path: entity.entityPath,
            commits
          });
        }
        done++;
        this.settings.set('checking_progress', [ done, entities.length ]);
      }));
    }
    this.settings.set('updates', updates);
    this.settings.set('last_check', Date.now());

    this.settings.set('checking', false);
    if (updates.length > 0 && this.settings.get('automatic', false)) {
      this.settings.set('updating', true);
    }
  }

  async doUpdate () {
    this.settings.set('updating', true);
  }

  async getGitInfos () {
    const branch = await exec('git branch', this.cwd)
      .then(({ stdout }) =>
        stdout
          .toString()
          .split('\n')
          .find(l => l.startsWith('*'))
          .slice(2)
          .trim()
      );

    const revision = await exec(`git rev-parse ${branch}`, this.cwd)
      .then(r => r.stdout.toString().trim());

    const upstream = await exec('git remote get-url origin', this.cwd)
      .then(r => r.stdout.toString().match(/github\.com[:/]([\w-_]+\/[\w-_]+)/)[1]);

    return {
      upstream,
      branch,
      revision
    };
  }

  // Experimental
  toggleExperimental () {
    const current = this.settings.get('__experimental_20-10-19', false);
    if (!current) {
      this.warn('WARNING: This will enable the experimental new updater, that is NOT functional yet.');
      this.warn('WARNING: Do NOT use this experimental version as you would use the normal version.');
      this.warn('WARNING: Use it at your own risk! Powercord Staff won\'t help you with issues occurring with the beta.');
    } else {
      this.log('Experimental updater disabled.');
    }
    this.settings.set('__experimental_20-10-19', !current);
    powercord.pluginManager.remount('pc-updater');
  }

  // LEGACY
  async checkForUpdateLegacy (callback, force = false) {
    if (!this.settings.get('checkForUpdates', true) && !force) {
      return;
    }

    this.checking = true;

    await exec('git fetch', this.cwd);
    const gitStatus = await exec('git status -uno', this.cwd).then(({ stdout }) => stdout.toString());

    if (gitStatus.includes('git pull')) {
      this.askUpdateLegacy();
    }

    this.checking = false;
    if (callback) {
      return callback();
    }
  }

  askUpdateLegacy () {
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
            this.updateLegacy(setState)
              .then(() => container.remove())
        }, {
          text: 'Update and reboot',
          onClick: (setState) =>
            this.updateLegacy(setState)
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

  updateLegacy (setState) {
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
