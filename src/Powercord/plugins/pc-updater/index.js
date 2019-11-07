const { React, getModule, getModuleByDisplayName } = require('powercord/webpack');
const { open: openModal, close: closeModal } = require('powercord/modal');
const { Confirm } = require('powercord/components/modal');
const { Plugin } = require('powercord/entities');

const { resolve, join } = require('path');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

const Settings = require('./components/Settings.jsx');

const changelog = require('../../../../changelogs.json');

module.exports = class Updater extends Plugin {
  constructor () {
    super();

    this.checking = false;
    this.cwd = { cwd: join(__dirname, ...Array(4).fill('..')) };
  }

  async startPlugin () {
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

    this._interval = setInterval(this.checkForUpdates.bind(this), minutes * 60 * 1000);
    this.checkForUpdates();

    const lastChangelog = this.settings.get('last_changelog', '');
    if (changelog.id !== lastChangelog) {
      this.openChangeLogs();
    }
  }

  pluginWillUnload () {
    clearInterval(this._interval);
  }

  async checkForUpdates (allConcurrent = false) {
    if (
      this.settings.set('disabled', false) ||
      this.settings.set('paused', false) ||
      this.settings.set('checking', false) ||
      this.settings.set('updating', false)
    ) {
      return;
    }

    this.settings.set('checking', true);
    this.settings.set('checking_progress', [ 0, 0 ]);
    const disabled = this.settings.get('entities_disabled', []).map(e => e.id);
    const skipped = this.settings.get('entities_skipped', []);
    const plugins = [ ...powercord.pluginManager.plugins.values() ].filter(p => !p.isInternal);
    const themes = [ ...powercord.styleManager.themes.values() ].filter(t => t.isTheme);

    const entities = plugins.concat(themes).filter(e => !disabled.includes(e.updateIdentifier) && e.isUpdatable());
    if (!disabled.includes(powercord.updateIdentifier)) {
      entities.push(powercord);
    }

    let done = 0;
    const updates = [];
    const entitiesLength = entities.length;
    const parallel = allConcurrent ? entitiesLength : this.settings.get('concurrency', 2);
    await Promise.all(Array(parallel).fill(null).map(async () => {
      let entity;
      while ((entity = entities.shift())) {
        const repo = await entity.getGitRepo();
        if (repo) {
          const shouldUpdate = await entity._checkForUpdates();
          if (shouldUpdate) {
            const commits = await entity._getUpdateCommits();
            if (skipped[entity.updateIdentifier] === commits[0].id) {
              return;
            }
            updates.push({
              id: entity.updateIdentifier,
              name: entity.constructor.name,
              icon: entity.__proto__.__proto__.constructor.name.replace('Updatable', 'Powercord'),
              commits,
              repo
            });
          }
        }
        done++;
        this.settings.set('checking_progress', [ done, entitiesLength ]);
      }
    }));

    this.settings.set('updates', updates);
    this.settings.set('last_check', Date.now());
    this.settings.set('checking', false);
    if (updates.length > 0) {
      if (this.settings.get('automatic', false)) {
        this.doUpdate();
      } else if (!document.querySelector('#powercord-updater')) {
        this.sendToast('powercord-updater', {
          header: 'Updates are available!',
          content: 'Click "Update" to update now or "Open Updater" to find out more.',
          icon: 'wrench',
          buttons: [ {
            text: 'Update',
            color: 'green',
            look: 'outlined',
            onClick: () => this.doUpdate()
          }, {
            text: 'Open Updater',
            color: 'blue',
            look: 'ghost',
            onClick: async () => {
              const settingsModule = await getModule([ 'open', 'saveAccountChanges' ]);
              settingsModule.open('pc-updater');
            }
          } ]
        });
      }
    }
  }

  async doUpdate (force = false) {
    this.settings.set('failed', false);
    this.settings.set('updating', true);
    const updates = this.settings.get('updates', []);
    const failed = [];
    for (const update of [ ...updates ]) {
      let entity = powercord;
      if (update.id.startsWith('plugin')) {
        entity = powercord.pluginManager.get(update.id.replace('plugins_', ''));
      } else if (update.id.startsWith('theme')) {
        entity = powercord.styleManager.get(update.id.replace('themes_', ''));
      }

      const success = await entity._update(force);
      updates.shift();
      this.settings.get('updates', updates);
      if (!success) {
        failed.push(update);
      }
    }

    this.settings.set('updating', false);
    if (failed.length > 0) {
      this.settings.set('failed', true);
      this.settings.set('updates', failed);
      if (!document.querySelector('#powercord-updater')) {
        this.sendToast('powercord-updater', {
          header: 'Some updates failed to install...',
          type: 'danger',
          buttons: [ {
            text: 'Force Update',
            color: 'red',
            look: 'outlined',
            onClick: () => this.askForce()
          }, {
            text: 'Ignore',
            look: 'outlined',
            color: 'grey'
          }, {
            text: 'Open Updater',
            color: 'blue',
            look: 'ghost',
            onClick: async () => {
              const settingsModule = await getModule([ 'open', 'saveAccountChanges' ]);
              settingsModule.open('pc-updater');
            }
          } ]
        });
      }
    }
  }

  // MODALS
  askForce (callback) {
    openModal(() =>
      React.createElement(Confirm, {
        red: true,
        header: 'Force update?',
        confirmText: 'Force update',
        cancelText: 'Cancel',
        onConfirm: () => {
          if (callback) {
            // eslint-disable-next-line callback-return
            callback();
          }
          this.doUpdate(true);
        },
        onCancel: closeModal
      }, React.createElement('div', { className: 'powercord-text' },
        'Are you sure you want to force update? Any local edit will be overwritten!'))
    );
  }

  // UTILS
  skipUpdate (id, commit) {
    this.settings.set('entities_skipped', {
      ...this.settings.get('entities_skipped', {}),
      [id]: commit
    });
    this._removeUpdate(id);
  }

  disableUpdates (entity) {
    this.settings.set('entities_disabled', [
      ...this.settings.get('entities_disabled', []),
      {
        id: entity.id,
        name: entity.name,
        icon: entity.icon
      }
    ]);
    this._removeUpdate(entity.id);
  }

  enableUpdates (id) {
    this.settings.set('entities_disabled', this.settings.get('entities_disabled', []).filter(d => d.id !== id));
  }

  _removeUpdate (id) {
    this.settings.set('updates', this.settings.get('updates', []).filter(u => u.id !== id));
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

  async changeBranch (branch) {
    await exec('git fetch', this.cwd);
    await exec(`git checkout ${branch}`, this.cwd);
    await exec('git pull', this.cwd);
    location.reload();
  }

  // Change Log
  async openChangeLogs () {
    const ChangeLog = await this._getChangeLogsComponent();
    openModal(() => React.createElement(ChangeLog));
  }

  async _getChangeLogsComponent () {
    if (!this._ChangeLog) {
      const _this = this;
      const changeLogModule = await getModule([ 'changeLog' ]);
      const { video } = await getModule([ 'video', 'added' ]);
      const DiscordChangeLog = await getModuleByDisplayName('ChangeLog');

      class ChangeLog extends DiscordChangeLog {
        render () {
          const originalGetter = Object.getOwnPropertyDescriptor(changeLogModule.__proto__, 'changeLog').get;
          Object.defineProperty(changeLogModule, 'changeLog', {
            get: () => _this.formatChangeLog(changelog),
            configurable: true
          });
          const res = super.render();
          setImmediate(() => {
            Object.defineProperty(changeLogModule, 'changeLog', {
              get: originalGetter,
              configurable: true
            });
          });
          return res;
        }

        renderHeader () {
          const header = super.renderHeader();
          header.props.children[0].props.children = `Powercord - ${header.props.children[0].props.children}`;
          return header;
        }

        renderVideo () {
          if (!changelog.image) {
            return null;
          }

          return React.createElement('img', {
            src: changelog.image,
            className: video,
            alt: ''
          });
        }

        renderFooter () {
          const footer = super.renderFooter();
          footer.props.children = React.createElement('span', {
            dangerouslySetInnerHTML: {
              __html: changelog.footer
            }
          });
          return footer;
        }

        componentWillUnmount () {
          super.componentWillUnmount();
          _this.settings.set('last_changelog', changelog.id);
        }
      }

      this._ChangeLog = ChangeLog;
    }
    return this._ChangeLog;
  }

  formatChangeLog (json) {
    let body = '';
    const colorToClass = {
      GREEN: 'added',
      ORANGE: 'progress',
      RED: 'fixed',
      BLURPLE: 'improved'
    };
    json.contents.forEach(item => {
      if (item.type === 'HEADER') {
        body += `${item.text.toUpperCase()} {${colorToClass[item.color]}${item.noMargin ? ' marginTop' : ''}}\n======================\n\n`;
      } else {
        if (item.text) {
          body += item.text;
          body += '\n\n';
        }
        if (item.list) {
          body += ` * ${item.list.join('\n\n * ')}`;
          body += '\n\n';
        }
      }
    });
    return {
      date: json.date,
      locale: 'en-us',
      revision: 1,
      body
    };
  }
};
