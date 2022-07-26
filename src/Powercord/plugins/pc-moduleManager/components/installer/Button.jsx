const { React } = require('powercord/webpack');
const { Clickable } = require('powercord/components');
const { cloneRepo, REPO_URL_REGEX } = require('../../util');

module.exports = class Button extends React.Component {
  render () {
    const [ GitURL, , RepoName ] = this.props.message.content.match(REPO_URL_REGEX) ?? [];
    if (!GitURL) {
      return <></>;
    }

    const installed = this.props.type === 'plugin'
      ? powercord.pluginManager.isInstalled(RepoName)
      : powercord.styleManager.isInstalled(RepoName);

    return (
      <div
        className={[ 'PluginDownloaderApply', installed && 'applied' ]
          .filter(Boolean)
          .join(' ')}
      >
        <Clickable
          onClick={() => {
            if (installed) {
              return;
            }
            cloneRepo(GitURL, powercord, this.props.type);
          }}
        >
          {installed ? `${this.props.type === 'plugin' ? 'Plugin' : 'Theme'} Installed` : `Download ${this.props.type === 'plugin' ? 'Plugin' : 'Theme'}`}
        </Clickable>
      </div>
    );
  }
};
