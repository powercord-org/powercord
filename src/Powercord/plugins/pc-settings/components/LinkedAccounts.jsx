const { React } = require('powercord/webpack');
const { Icons: { Key, Refresh, Unlink } } = require('powercord/components');

const Account = require('./Account.jsx');

module.exports = (props) => {
  const syncEnabled = powercord.settings.get('settingsSync', false);

  return <div className='powercord-account-list'>
    <div className='powercord-account-list-accounts'>
      <Account type='spotify'/>
      <Account type='github'/>
      {syncEnabled && <div className='powercord-account-list-account'>
        <Key/>
        <a className='powercord-account-item' href='#' onClick={() => props.passphrase()}>Update passphrase</a>
      </div>}
    </div>
    <div>
      <div className='powercord-account-list-account'>
        <Refresh/>
        <a className='powercord-account-item' href='#' onClick={() => props.refresh()}>Refresh accounts</a>
      </div>

      <div className='powercord-account-list-account'>
        <Unlink/>
        <a className='powercord-account-item' href='#' onClick={() => props.unlink()}>Unlink</a>
      </div>
    </div>
  </div>;
};
