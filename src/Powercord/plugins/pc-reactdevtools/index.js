const { join } = require('path');
const { remote } = require('electron');
const { createWriteStream, existsSync, readFileSync } = require('fs');
const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');
const unzip = require('unzip-crx');

// stolen from https://github.com/Inve1951/BetterDiscordStuff/blob/master/plugins/enableReactDevtools.plugin.js
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
        this.log(
          'If you are unable to find the tabs for React Dev Tools in the Developer Tools Tab Bar, reload your client(ctrl + r).'
        );
      });
    }, err => this.error(err)), err => this.error(err));
  }

  startPlugin () {
    this.listener = this.listener.bind(this);
    if (!this.isInstalledLocally) {
      this.download();
    }
    this.checkForUpdate();
    remote.getCurrentWindow().webContents.on('devtools-opened', this.listener);
    if (remote.getCurrentWindow().webContents.isDevToolsOpened()) {
      this.listener();
    }
  }

  pluginWillUnload () {
    remote
      .getCurrentWindow()
      .webContents.removeListener('devtools-opened', this.listener);
  }

  listener () {
    remote.BrowserWindow.removeDevToolsExtension('React Developer Tools');

    if (this.isInstalledLocally) {
      if (remote.BrowserWindow.addDevToolsExtension(this.folderPath)) {
        this.log('Successfully installed react devtools.');
        this.log(
          'If React Dev Tools is empty, close Developer Tools and re-open it.'
        );
      } else {
        this.error('Couldn\'t find react devtools in chrome extensions!');
      }
    }
  }
};
