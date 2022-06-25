const { React } = require('powercord/webpack');
const { Clickable } = require('powercord/components');
const cloneRepo = require('../../util/cloneRepo.js');

module.exports = class Button extends React.Component {
  render () {
    const [ GitURL, , , RepoName ] = this.props.message.content.match(/https?:\/\/(www.)?git(hub).com\/[\w-]+\/([\w-\._]+)\/?/) ?? [];
    if (!GitURL) {
      return <></>;
    }

    const installed = this.props.type === 'plugin'
      ? powercord.pluginManager.isInstalled(RepoName)
      : powercord.styleManager.isInstalled(RepoName);

    if (!this.props.message.content.includes('https://github.com')) {
      return (
        <div className={[ 'PluginDownloaderApply', installed ? 'applied' : '' ].filter(Boolean).join(' ')}>
          <Clickable
            onClick={() => {
              if (installed) {
                return;
              }
              cloneRepo(GitURL, powercord, this.props.type);
            }}
          >
                        No Plugin.
          </Clickable>
        </div>
      );
    }
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
