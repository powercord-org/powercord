const { React, i18n: { Messages } } = require('powercord/webpack');
const { Button, Spinner } = require('powercord/components');

// @todo: merge with Product/
module.exports = ({ id, installing, onUninstall }) =>
  <div className='powercord-plugin-footer'>
    {/* <Button
      onClick={() => openExternal(`https://github.com/${REPO_URL}`)}
      look={Button.Looks.LINK}
      size={Button.Sizes.SMALL}
      color={Button.Colors.TRANSPARENT}
    >
      Repository
    </Button> */}

    <div className='btn-group'>
      {!id.startsWith('pc-') && <Button
        disabled={installing}
        onClick={onUninstall}
        color={Button.Colors.RED}
        look={Button.Looks.FILLED}
        size={Button.Sizes.SMALL}
      >
        {installing
          ? <Spinner type='pulsingEllipsis'/>
          : Messages.APPLICATION_CONTEXT_MENU_UNINSTALL}
      </Button>}
    </div>
  </div>;
