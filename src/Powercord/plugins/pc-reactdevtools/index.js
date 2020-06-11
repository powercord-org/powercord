const { join } = require('path');
const { remote } = require('electron');
const {
  createWriteStream,
  existsSync,
  readFileSync,
  unlinkSync
} = require('fs');
const { Plugin } = require('powercord/entities');
const { get } = require('powercord/http');

const unzip = require('unzip-crx');

const crxPath = join(__dirname, 'rdt.crx');
const devtoolsPath = join(__dirname, 'react-dev-tools');

// @todo: Throw this plugin away and use a better loading method
module.exports = class ReactDevtools extends Plugin {
  get isInstalledLocally () {
    return existsSync(crxPath);
  }

  startPlugin () {
    if (!this.isInstalledLocally) {
      this.download();
    }

    this.checkForUpdate();

    this.addReactDevTools();
  }

  pluginWillUnload () {
    this.removeReactDevTools();
  }

  addReactDevTools () {
    this.removeReactDevTools();

    if (this.isInstalledLocally) {
      remote.BrowserWindow.addDevToolsExtension(devtoolsPath)
        .then(() => {
          this.log(`Successfully installed React DevTools.
If React DevTools is missing or empty, close Developer Tools and re-open it.
If you are still unable to find tabs for React DevTools in Developer Tools, reload your client (Ctrl + R)."`);
        })
        .catch((e) => {
          this.error("Couldn't find React DevTools in Chrome extensions!");
        });
    }
  }

  removeReactDevTools () {
    remote.BrowserWindow.removeDevToolsExtension('React Developer Tools');
  }

  checkForUpdate () {
    const local = readFileSync(crxPath);
    const crxLink =
      'https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=77.0.3865.90&acceptformat=crx2&x=id=fmkadmapgofadopljbjfkapdkoienihi%26uc';
    return get(crxLink).then(
      (res) => {
        if (res.body !== local) {
          this.download();
        }
      },
      (err) => this.error(err)
    );
  }

  download () {
    const crxLink =
      'https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=77.0.3865.90&acceptformat=crx2&x=id=fmkadmapgofadopljbjfkapdkoienihi%26uc';
    return get(crxLink).then(
      (res) =>
        get(res.headers.location).then(
          (resp) => {
            const crxFile = createWriteStream(crxPath);
            crxFile.write(resp.body, (err) => {
              if (err) {
                this.error(err);
              }

              // Finish writing to the file and close it before trying to unzip it.
              crxFile.close();

              try {
                // Purge the current folder if it already exists.
                unlinkSync(devtoolsPath);
              } catch (e) {
                this.error(e);
              }
              // Unzip the folder.
              unzip(crxPath, devtoolsPath).then(() => {
                this.addReactDevTools();
              });
            });
          },
          (err) => this.error(err)
        ),
      (err) => this.error(err)
    );
  }
};
