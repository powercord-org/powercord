const { shell: { openExternal } } = require('electron');
const { React } = require('powercord/webpack');
const { Tooltip, Switch, Button, Spinner } = require('powercord/components');
const { Author, Version, Description, License } = require('./Icons');

module.exports = class Plugin extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      installing: false
    };
  }

  render () {
    const {
      id, enforced, installed, enabled, awaitingReload, manifest, // Properties
      onEnable, onDisable, onInstall, onUninstall // Events
    } = this.props;
    return <div className='powercord-plugin'>
      <div className='powercord-plugin-header'>
        <h4>{manifest.name}</h4>
        {installed &&
        <EnableComponent
          enforced={enforced}
          enabled={enabled}
          onEnable={onEnable}
          onDisable={onDisable}
        />}
      </div>
      <div className='powercord-plugin-container'>
        <div>
          <Tooltip text='Author(s)' position='top'>
            <Author/>
          </Tooltip>
          <span>{manifest.author}</span>
        </div>
        <div>
          <Tooltip text='Version' position='top'>
            <Version/>
          </Tooltip>
          <span>v{manifest.version}</span>
        </div>
        <div>
          <Tooltip text='License' position='top'>
            <License/>
          </Tooltip>
          <span>{manifest.license}</span>
        </div>
        <div className='description'>
          <Tooltip text='Description' position='top'>
            <Description/>
          </Tooltip>
          <span>{manifest.description}</span>
        </div>
      </div>
      <div className='powercord-plugin-footer'>
        <Button
          onClick={() => openExternal(manifest.repo || 'https://github.com/aetheryx/powercord')}
          className={Button.Colors.TRANSPARENT}
        >
          Repository
        </Button>

        {enforced && <Tooltip text="You can't hide this plugin" position='top'>
          <Button disabled className={Button.Colors.RED}>Hide</Button>
        </Tooltip>}

        {!enforced && (awaitingReload
          ? <Button disabled className={Button.Colors.YELLOW}>Awaiting Reload</Button>
          : <Button
            disabled={this.state.installing}
            onClick={() => this.process(installed ? onInstall : onUninstall)}
            className={installed ? Button.Colors.RED : Button.Colors.GREEN}
          >
            {this.state.installing
              ? <Spinner type='pulsingEllipsis'/>
              : (installed ? (id.startsWith('pc-') ? 'Hide' : 'Uninstall') : 'Install')}
          </Button>)}
      </div>
    </div>;
  }

  async process (func) {
    this.setState({ installing: true });
    // See that so loader appears? :weSmart:
    setTimeout(async () => {
      await func();
      this.setState({ installing: false });
    }, 1000);
  }
};

const EnableComponent = ({ enforced, enabled, onEnable, onDisable }) => {
  const tooltip = enforced ? 'You can\'t disable this plugin' : (enabled ? 'Disable' : 'Enable');
  return <Tooltip text={tooltip} position='top'>
    <div>
      <Switch value={enabled} onChange={enabled ? onDisable : onEnable} disabled={enforced}/>
    </div>
  </Tooltip>;
};
