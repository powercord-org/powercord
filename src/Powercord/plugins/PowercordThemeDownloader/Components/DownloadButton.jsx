const {
  React,
  i18n: { Messages },
} = require("powercord/webpack");
const { Clickable } = require("powercord/components");
const downloadTheme = require("../downloadTheme");
class DownloadButton extends React.Component {
  render() {
    var GithubLink = this.props.message.content
      .replace(/(?:\n|<|>)/g, " ")
      .split(" ")
      .filter((f) =>
        f.match(/^https?:\/\/(www.)?git(hub|lab).com\/[\w-]+\/[\w-]+\/?/)
      )[0];
    if (!GithubLink) return <></>;
    const repoNameMatch = GithubLink.match(/([\w-]+)\/?$/)[0];
    if (!repoNameMatch) return <></>;
    const repoName = repoNameMatch[1];
    var installed = powercord.styleManager.isInstalled(repoName);
    if (!this.props.message.content.includes("https://github.com")) {
      return (
        <div
          className={["ThemeDownloaderApply", installed ? "applied" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <Clickable
            onClick={() => {
              if (installed) return;
              downloadTheme(GithubLink, powercord);
            }}
          >
            No Plugin
          </Clickable>
        </div>
      );
    } else {
      return (
        <div
          className={["ThemeDownloaderApply", installed && "applied"]
            .filter(Boolean)
            .join(" ")}
        >
          <Clickable
            onClick={() => {
              if (installed) return;
              downloadTheme(GithubLink, powercord);
            }}
          >
            {installed ? "Theme Installed" : "Download Theme"}
          </Clickable>
        </div>
      );
    }
  }
}

module.exports = DownloadButton;
