const { React, i18n: { Messages } } = require('powercord/webpack');
const { Icons: { Sync, Unlink } } = require('powercord/components');

const Account = require('./Account.jsx');

// const syncEnabled = powercord.settings.get('settingsSync', false);
module.exports = (props) => (
  <div className='powercord-account-list'>
    <div className='powercord-account-list-accounts'>
      <Account type='Spotify'/>
      {/* syncEnabled && <div className='powercord-account-list-account'>
        <Key/>
        <a className='powercord-account-item' href='#' onClick={() => props.passphrase()}>
          {Messages.REPLUGGED_UPDATE_PASSPHRASE}
        </a>
      </div> */}
    </div>
    <div>
      <div className='powercord-account-list-account'>
        <Sync/>
        <a className='powercord-account-item' href='#' onClick={() => props.refresh()}>
          {Messages.REPLUGGED_REFRESH_ACCOUNTS}
        </a>
      </div>

      <div className='powercord-account-list-account'>
        <Unlink/>
        <a className='powercord-account-item' href='#' onClick={() => props.unlink()}>
          {Messages.REPLUGGED_UNLINK}
        </a>
      </div>
    </div>
  </div>
);
