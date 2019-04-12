const { shell: { openExternal } } = require('electron');
const { React } = require('powercord/webpack');
const { REPO_URL } = require('powercord/constants');
const { Button, Spinner } = require('powercord/components');

module.exports = ({ id, installed, installing, onUninstall, onInstall }) =>
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
        disabled={installing}
        onClick={installed ? onUninstall : onInstall}
        color={installed ? Button.Colors.RED : Button.Colors.GREEN}
        look={Button.Looks.FILLED}
        size={Button.Sizes.SMALL}
      >
        {installing
          ? <Spinner type='pulsingEllipsis'/>
          : (installed ? 'Uninstall' : 'Install')}
      </Button>}
    </div>
  </div>;
