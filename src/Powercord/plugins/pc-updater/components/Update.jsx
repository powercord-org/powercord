const { React } = require('powercord/webpack');
const { Button, Tooltip } = require('powercord/components');

const Icons = require('./Icons');

module.exports = class Update extends React.Component {
  constructor () {
    super();
    this.plugin = powercord.pluginManager.get('pc-updater');
  }

  render () {
    const { name, icon, repo, commits, updating, awaiting, onUpdate, onSkip, onDisable, onReload } = this.props;
    return <div className='update'>
      <div className='title'>
        <div className='icon'>
          <Tooltip text={icon} position='left'>
            {React.createElement(Icons[icon])}
          </Tooltip>
        </div>
        <div className='name'>{name}</div>
        <div className='actions'>
          {updating
            ? <Button color={Button.Colors.GREEN} disabled>
              Updating...
            </Button>
            : awaiting
              ? <Button look={Button.Looks.OUTLINED} color={Button.Colors.YELLOW} onClick={onReload}>
                Awaiting Reload
              </Button>
              : <>
                <Button color={Button.Colors.GREEN} onClick={onUpdate}>
                  Update Now
                </Button>
                <Button look={Button.Looks.OUTLINED} color={Button.Colors.RED} onClick={onSkip}>
                  Skip this update
                </Button>
                <Button color={Button.Colors.RED} onClick={onDisable}>
                  Disable updates
                </Button>
              </>}
        </div>
      </div>
      <div className='summary'>
        {commits.map(commit => <div key={commit.id}>
          <a href={`https://github.com/${repo}/commit/${commit.id}`} target='_blank'>
            <code>{commit.id.substring(0, 7)}</code>
          </a>
          <span>{commit.message} - {commit.author}</span>
        </div>)}
      </div>
    </div>;
  }
};
