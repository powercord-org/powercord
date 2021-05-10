const { join } = require("path");
const { Plugin } = require("powercord/entities");
const { getModule, React } = require("powercord/webpack");
const { inject, uninject } = require("powercord/injector");
const { spawn } = require("child_process");
const fs = require("fs");
const { findInReactTree, forceUpdateElement } = require("powercord/util");
const DownloadButton = require("./Components/DownloadButton");
const DownloadTheme = require("./downloadTheme");
module.exports = class PowercordThemeDownloader extends Plugin {
  async startPlugin() {
    this.injectContextMenu();
    this.injectMiniPopover();
    this.loadStylesheet("styles/style.scss");
  }

  async injectMiniPopover() {
    const MiniPopover = await getModule(
      (m) => m.default && m.default.displayName === "MiniPopover"
    );
    inject("ThemeDownloaderButton", MiniPopover, "default", (args, res) => {
      const props = findInReactTree(res, (r) => r && r.message && r.setPopout);
      if (!props || props.channel.id !== "755005710323941386") {
        return res;
      }

      res.props.children.unshift(
        React.createElement(DownloadButton, {
          message: props.message,
          main: this,
        })
      );
      return res;
    });
    MiniPopover.default.displayName = "MiniPopover";
  }

  async injectContextMenu() {
    const menu = await getModule(["MenuItem"]);
    console.log(menu.MenuItem)
    const mdl = await getModule(
      (m) => m.default && m.default.displayName === "MessageContextMenu"
    );
    inject("ThemeDownloader", mdl, "default", ([{ target }], res) => {
      if (!target || !target.href || !target.tagName) return res
      var match = target.href.match(
        /^https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/[\w-]+\/?/
      );
      if (target.tagName.toLowerCase() === "a" && match) {
        var repoName = target.href.match(/([\w-]+)\/?$/)[0];
        res.props.children.splice(
          4,
          0,
          React.createElement(menu.MenuItem, {
            name: powercord.styleManager.isInstalled(repoName)
              ? "Theme Already Installed"
              : "Install Theme",
            separate: true,
            id: "ThemeDownloaderContextLink",
            label: powercord.styleManager.isInstalled(repoName)
            ? "Theme Already Installed"
            : "Install Theme",
            action: () => DownloadTheme(target.href, powercord),
          })
        );
      }
      return res;
    });
    mdl.default.displayName = "MessageContextMenu";
  }


  pluginWillUnload() {
    uninject("ThemeDownloader");
    uninject("ThemeDownloaderButton")
  }
};
