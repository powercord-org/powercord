const {
  React,
  i18n: { Messages },
} = require("powercord/webpack");
const { Clickable } = require("powercord/components");
const DownloadPlugin = require("../downloadPlugin");
const downloadPlugin = require("../downloadPlugin");
class DownloadButton extends React.Component {
  render() {
    var GithubLink = this.props.message.content
      .replace(/(?:\n|<|>)/g, " ")
      .split(" ")
      .filter((f) =>
        f.match(/^https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/[\w-]+\/?/)
      )[0];
    if (!GithubLink) return <></>;
    const repoNameMatch = GithubLink.match(/([\w-]+)\/?$/);
    if (!repoNameMatch) return <></>;
    const repoName = repoNameMatch[1];
    var installed = powercord.pluginManager.isInstalled(repoName);
    if (!this.props.message.content.includes("https://github.com")) {
      return (
        <div
          className={["PluginDownloaderApply", installed ? "applied" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <Clickable
            onClick={() => {
              if (installed) return;
              downloadPlugin(GithubLink, powercord);
            }}
          >
            No Plugin
          </Clickable>
        </div>
      );
    } else {
      return (
        <div
          className={["PluginDownloaderApply", installed && "applied"]
            .filter(Boolean)
            .join(" ")}
        >
          <Clickable
            onClick={() => {
              if (installed) return;
              downloadPlugin(GithubLink, powercord);
            }}
          >
            {installed ? "Plugin Installed" : "Download Plugin"}
          </Clickable>
        </div>
      );
    }
  }
}

module.exports = DownloadButton;
