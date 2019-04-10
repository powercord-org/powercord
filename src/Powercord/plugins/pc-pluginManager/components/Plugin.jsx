const { shell: { openExternal } } = require('electron');
const { React } = require('powercord/webpack');
const { REPO_URL } = require('powercord/constants');
const {
  Tooltip, Switch, Button, Spinner, Icons: {
    Author, Version, Description, License, Info
  }
} = require('powercord/components');

module.exports = class PluginManager extends React.Component {
  constructor (props) {
    super(props);

    this.state = {
      installing: false
    };
  }

  render () {
    const {
      id, installed, enabled, manifest, // Properties
      onEnable, onDisable, onInstall, onUninstall // Events
    } = this.props;
    const versionInt = parseInt(manifest.version.replace(/\./g, ''));

    return <div className='powercord-plugin'>
      <div className='powercord-plugin-header'>
        <h4>{manifest.name}</h4>
        {installed &&
        <Tooltip text={enabled ? 'Disable' : 'Enable'} position='top'>
          <div>
            <Switch value={enabled} onChange={enabled ? onDisable : onEnable}/>
          </div>
        </Tooltip>}
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
          {versionInt < 100 &&
          <Tooltip text='This plugin is in beta' position='top'>
            <Info/>
          </Tooltip>
          }
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
          onClick={() => openExternal(`https://github.com/${REPO_URL}`)}
          look={Button.Looks.LINK}
          size={Button.Sizes.SMALL}
          color={Button.Colors.TRANSPARENT}
        >
          Repository
        </Button>

        <div className='btn-group'>
          {!id.startsWith('pc-') && <Button
            disabled={this.state.installing}
            onClick={() => this.process(installed ? onUninstall : onInstall)}
            look={Button.Looks.FILLED}
            color={installed ? Button.Colors.RED : Button.Colors.GREEN}
            size={Button.Sizes.SMALL}
          >
            {this.state.installing
              ? <Spinner type='pulsingEllipsis'/>
              : (installed ? 'Uninstall' : 'Install')}
          </Button>}
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
