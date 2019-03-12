const { resolve, join } = require('path');
const { remote } = require('electron');
const { readdir } = require('fs').promises;
const { Plugin } = require('powercord/entities');

// stolen from https://github.com/Inve1951/BetterDiscordStuff/blob/master/plugins/enableReactDevtools.plugin.js
module.exports = class ReactDevtools extends Plugin {
  get path () {
    const path = 'Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi';
    switch (process.platform) {
      case 'win32':
        return resolve(process.env.LOCALAPPDATA, 'Google/Chrome/User Data', path);
      case 'linux':
        return resolve(process.env.HOME, '.config/google-chrome', path);
      case 'darwin':
        return resolve(process.env.HOME, 'Library/Application Support/Google/Chrome', path);
    }

    return null;
  }

  pluginDidLoad () {
    /*
     * This plugin generates some CPU leaks, and we need to find a better way of doing this.
     * We should also download our own version of react devtools and use it instead of pulling it from Chrome
     *
     * this.listener = this.listener.bind(this);
     * remote.getCurrentWindow().webContents.on('devtools-opened', this.listener);
     * if (remote.getCurrentWindow().webContents.isDevToolsOpened()) {
     *   this.listener();
     * }
     */
  }

  pluginWillUnload () {
    // remote.getCurrentWindow().webContents.removeListener('devtools-opened', this.listener);
  }

  async listener () {
    remote.BrowserWindow.removeDevToolsExtension('React Developer Tools');

    let version;
    let ok = true;

    try {
      [ version ] = (await readdir(this.path)).slice(-1);
    } catch (err) {
      this.log(err);
      if (err.code !== 'ENOENT') {
        throw err;
      }
      ok = false;
    }

    if (ok && remote.BrowserWindow.addDevToolsExtension(join(this.path, version))) {
      this.log('Successfully installed react devtools.');
    } else {
      this.error('Couldn\'t find react devtools in chrome extensions!');
    }
  }
};
