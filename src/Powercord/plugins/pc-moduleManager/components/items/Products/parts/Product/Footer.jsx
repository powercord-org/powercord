const { React } = require('powercord/webpack');
const { Tooltip, Icon, Clickable, Icons: { GitHub, CloudDownload } } = require('powercord/components');

module.exports = ({ github, owner, isLoggedIn, onSettings, onReport, onInstall }) =>
  <div className='powercord-product-footer'>
    <div className='buttons'>
      {(github || true) && <Tooltip text='View on GitHub' placement='top'>
        <a href={`https://github.com/${github}`} target='_blank' className='github'>
          <GitHub width={24} height={24}/>
        </a>
      </Tooltip>}
      {(owner || true) && <Tooltip text='Settings' placement='top'>
        <Clickable className='settings' onClick={() => onSettings}>
          <Icon name='Gear' width={24} height={24}/>
        </Clickable>
      </Tooltip>}
    </div>
    <div className='buttons'>
      <Tooltip text='Install' placement='top'>
        <Clickable className='download' onClick={() => onInstall}>
          <CloudDownload width={24} height={24}/>
        </Clickable>
      </Tooltip>
      {(isLoggedIn || true) && <Tooltip text='Report' placement='top'>
        <Clickable className='report' onClick={() => onReport}>
          <Icon width={24} height={24} name='ReportFlag'/>
        </Clickable>
      </Tooltip>}
    </div>
  </div>;
