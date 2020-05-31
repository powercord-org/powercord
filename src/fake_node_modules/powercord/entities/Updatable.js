const Events = require('events');
const { join } = require('path');
const { existsSync } = require('fs');
const { promisify } = require('util');
const cp = require('child_process');
const exec = promisify(cp.exec);

/**
 * @property {String} entityID
 * @property {String} entityPath
 * @property {String} updateIdentifier
 */
class Updatable extends Events {
  constructor (basePath, entityID, updateIdentifier) {
    super();
    this.basePath = basePath;
    if (!this.entityID) {
      // It might be pre-defined by plugin manager
      this.entityID = entityID;
    }
    this.entityPath = join(this.basePath, this.entityID);
    if (!updateIdentifier) {
      updateIdentifier = `${this.basePath.split(/[\\/]/).pop()}_${this.entityID}`;
    }
    this.updateIdentifier = updateIdentifier;
  }

  get _cwd () {
    return { cwd: this.entityPath };
  }

  /**
   * @returns {Boolean} Whether this can be updated or not
   */
  isUpdatable () {
    return existsSync(join(this.basePath, this.entityID, '.git'));
  }

  async _checkForUpdates () {
    try {
      await exec('git fetch', this._cwd);
      const gitStatus = await exec('git status -uno', this._cwd).then(({ stdout }) => stdout.toString());
      return gitStatus.includes('git pull');
    } catch (e) {
      return false;
    }
  }

  async _getUpdateCommits () {
    const branch = await this.getBranch();

    const commits = [];
    const gitLog = await exec(`git log --format="%H -- %an -- %s" ..origin/${branch}`, this._cwd)
      .then(({ stdout }) => stdout.toString());
    const lines = gitLog.split('\n');
    lines.pop();
    lines.forEach(line => {
      const data = line.split(' -- ');
      commits.push({
        id: data.shift(),
        author: data.shift(),
        message: data.shift()
      });
    });
    return commits;
  }

  async _update (force = false) {
    try {
      let command = 'git pull --ff-only';
      if (force) {
        const branch = await this.getBranch();
        command = `git reset --hard origin/${branch}`;
      }
      await exec(command, this._cwd).then(({ stdout }) => stdout.toString());
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Fetches the git repository for this entity
   * @returns {Promise<String|null>}
   */
  async getGitRepo () {
    try {
      return await exec('git remote get-url origin', this._cwd)
        .then(r => r.stdout.toString().match(/github\.com[:/]([\w-_]+\/[\w-_]+)/)[1]);
    } catch (e) {
      console.warn('Failed to fetch git origin url; ignoring.');
      return null;
    }
  }

  /**
   * Fetches the current branch for this entity
   * @returns {Promise<String|null>}
   */
  getBranch () {
    return exec('git branch', this._cwd)
      .then(({ stdout }) =>
        stdout.toString().split('\n').find(l => l.startsWith('*')).slice(2).trim()
      );
  }
}

module.exports = Updatable;
