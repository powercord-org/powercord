const { join } = require("path");
const { remote } = require("electron");
const { createWriteStream, existsSync } = require("fs");
const { Plugin } = require("powercord/entities");
const request = require("request");
const unzip = require("unzip-crx");

// stolen from https://github.com/Inve1951/BetterDiscordStuff/blob/master/plugins/enableReactDevtools.plugin.js
module.exports = class ReactDevtools extends Plugin {
  get path() {
    return join(__dirname, "rdt.crx");
  }

  get folderPath() {
    return join(__dirname, "react-dev-tools");
  }

  get isInstalledLocally() {
    return existsSync(this.path);
  }

  download() {
    return request.get(
      "https://clients2.google.com/service/update2/crx?response=redirect&os=win&arch=x86-64&os_arch=x86-64&nacl_arch=x86-64&prod=chromecrx&prodchannel=unknown&prodversion=77.0.3865.90&acceptformat=crx2&x=id=fmkadmapgofadopljbjfkapdkoienihi%26uc",
      { encoding: null },
      (err, res, body) => {
        if (err) {
          this.error(err);
        }
        if (!Buffer.isBuffer(body)) {
          this.download();
        }
        const file = createWriteStream(this.path);
        file.write(body, err => {
          if (err) {
            this.error(err);
          }
          file.close();
        });
        unzip(this.path, this.folderPath).then(() => {
          this.listener();
          this.log(
            "If you are unable to find the tabs for React Developer Tools in the Developer Tools, Reload your client (ctrl + r)"
          );
        });
      }
    );
  }

  startPlugin() {
    this.listener = this.listener.bind(this);
    this.download();
    remote.getCurrentWindow().webContents.on("devtools-opened", this.listener);
    if (remote.getCurrentWindow().webContents.isDevToolsOpened()) {
      this.listener();
    }
  }

  pluginWillUnload() {
    remote
      .getCurrentWindow()
      .webContents.removeListener("devtools-opened", this.listener);
  }

  async listener() {
    remote.BrowserWindow.removeDevToolsExtension("React Developer Tools");

    if (this.isInstalledLocally) {
      if (remote.BrowserWindow.addDevToolsExtension(this.folderPath)) {
        this.log("Successfully installed react devtools.");
      } else {
        this.error("Couldn't find react devtools in chrome extensions!");
      }
    }
  }
};
