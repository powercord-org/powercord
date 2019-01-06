const { shell: { openExternal } } = require('electron');
const { React } = require('powercord/webpack');
const { Tooltip, Switch, Button, Spinner } = require('powercord/components');
const { Author, Version, Description, License, Info } = require('./Icons');

module.exports = class Plugin extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      installing: false
    };
  }

  render () {
    const {
      id, enforced, installed, enabled, hidden, awaitingReload, manifest, // Properties
      onEnable, onDisable, onInstall, onUninstall, onShow, onHide // Events
    } = this.props;
    const versionInt = parseInt(manifest.version.replace(/\./g, ''));

    return <div className='powercord-plugin'>
      <div className='powercord-plugin-header'>
        <h4>{manifest.name}</h4>
        {installed &&
        <EnableComponent
          enforced={enforced}
          enabled={enabled}
          onEnable={onEnable}
          onDisable={onDisable}
          awaitingReload={awaitingReload}
        />}
      </div>
      <div className='powercord-plugin-container'>
        <div className='author'>
          <Tooltip text='Author(s)' position='top'>
            <Author/>
          </Tooltip>
          <span>{manifest.author}</span>
        </div>
        <div className='version'>
          <Tooltip text='Version' position='top'>
            <Version/>
          </Tooltip>
          <span>v{manifest.version}</span>
          {versionInt < 100 && <Tooltip text='This plugin is in beta' position='top'>
            <Info/>
          </Tooltip>}
        </div>
        <div className='license'>
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
          look={Button.Looks.LINK}
          size={Button.Sizes.SMALL}
          color={Button.Colors.TRANSPARENT}
        >
          Repository
        </Button>

        <div className='btn-group'>
          <Button
            onClick={() => hidden ? onShow() : onHide()}
            look={hidden ? Button.Looks.FILLED : Button.Looks.LINK}
            color={hidden ? Button.Colors.GREEN : Button.Colors.TRANSPARENT}
            size={Button.Sizes.SMALL}
          >
            {hidden ? 'Show' : 'Hide'}
          </Button>
          {!id.startsWith('pc-') && (awaitingReload
            ? <Button disabled className={Button.Colors.YELLOW}>Awaiting Reload</Button>
            : <Button
              disabled={this.state.installing}
              onClick={() => this.process(installed ? onInstall : onUninstall)}
              look={installed ? Button.Looks.OUTLINED : Button.Looks.FILLED}
              color={installed ? Button.Colors.RED : Button.Colors.GREEN}
              size={Button.Sizes.SMALL}
            >
              {this.state.installing
                ? <Spinner type='pulsingEllipsis'/>
                : (installed ? 'Uninstall' : 'Install')}
            </Button>)}
        </div>
      </div>
    </div>;
  }

  async process (func) {
    this.setState({ installing: true });
    await func();
    this.setState({ installing: false });
  }
};

const EnableComponent = ({ enforced, awaitingReload, enabled, onEnable, onDisable }) => {
  const tooltip = awaitingReload
    ? 'Awaiting Reload'
    : (enforced ? 'You can\'t disable this plugin' : (enabled ? 'Disable' : 'Enable'));

  return <Tooltip text={tooltip} position='top'>
    <div>
      <Switch value={enabled} onChange={enabled ? onDisable : onEnable} disabled={enforced || awaitingReload}/>
    </div>
  </Tooltip>;
};
