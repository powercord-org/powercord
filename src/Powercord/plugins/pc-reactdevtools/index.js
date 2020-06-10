const { join } = require('path');
const { ipcRenderer } = require('electron');
const { createWriteStream, existsSync, readFileSync } = require('fs');
const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');

const unzip = require('unzip-crx');

// @todo: Throw this plugin away and use a better loading method
module.exports = class ReactDevtools extends Plugin {
  get path () {
    return join(__dirname, 'rdt.crx');
  }

  get folderPath () {
    return join(__dirname, 'react-dev-tools');
  }

  get isInstalledLocally () {
    return existsSync(this.path);
  }

  startPlugin () {
    // eslint-disable-next-line no-unreachable
    this.listener = this.listener.bind(this);
    if (!this.isInstalledLocally) {
      this.download();
    }

    this.checkForUpdate();

    ipcRenderer.send('pc-handleDevTools');
    ipcRenderer.on('pc-devToolsOpened', this.listener.bind(this));
    if (ipcRenderer.sendSync('pc-getDevToolsOpened')) {
      this.listener();
    }
  }

  pluginWillUnload () {
    ipcRenderer.send('pc-stopHandleDevTools');
  }

  listener () {
    ipcRenderer.send('pc-removeDevToolsExtension', 'React Developer Tools');

    if (this.isInstalledLocally) {
      if (ipcRenderer.sendSync('pc-addDevToolsExtension', this.folderPath)) {
        this.log('Successfully installed React DevTools.');
        this.log('If React DevTools is missing or empty, close Developer Tools and re-open it.');
      } else {
        this.error('Couldn\'t find React DevTools in Chrome extensions!');
      }
    }
  }

  checkForUpdate () {
    const local = readFileSync(this.path);
    const crxLink = 'https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=77.0.3865.90&acceptformat=crx2&x=id=fmkadmapgofadopljbjfkapdkoienihi%26uc';
    return get(crxLink).then(res => {
      if (res.body !== local) {
        this.download();
      }
    }, err => this.error(err));
  }

  download () {
    const crxLink = 'https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=77.0.3865.90&acceptformat=crx2&x=id=fmkadmapgofadopljbjfkapdkoienihi%26uc';
    return get(crxLink).then(res => get(res.headers.location).then(resp => {
      const crxFile = createWriteStream(this.path);
      crxFile.write(resp.body, err => {
        if (err) {
          this.error(err);
        }
        return crxFile.close();
      });

      unzip(this.path, this.folderPath).then(() => {
        this.listener();
        this.log('If you are still unable to find tabs for React DevTools in Developer Tools, reload your client (Ctrl + R).');
      });
    }, err => this.error(err)), err => this.error(err));
  }
};
