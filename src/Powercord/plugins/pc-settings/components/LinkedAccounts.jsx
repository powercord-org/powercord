const { React } = require('powercord/webpack');

const Account = require('./Account.jsx');

module.exports = (props) => {
  const baseUrl = powercord.settings.get('backendURL', 'https://powercord.xyz');
  const syncEnabled = powercord.settings.get('settingsSync', false);

  return <div className='powercord-account-list'>
    <div className='powercord-account-list-accounts'>
      <Account type='spotify'/>
      <Account type='github'/>

      {syncEnabled && <div className='powercord-account-list-account'>
        <img src={`${baseUrl}/assets/icons/key.svg`} alt='key'/>
        <a className='powercord-account-item' href='#' onClick={() => props.passphrase()}>Update passphrase</a>
      </div>}
    </div>
    <div>
      <div className='powercord-account-list-account'>
        <img src={`${baseUrl}/assets/icons/reload.svg`} alt='key'/>
        <a className='powercord-account-item' href='#' onClick={() => props.refresh()}>Refresh accounts</a>
      </div>

      <div className='powercord-account-list-account'>
        <img src={`${baseUrl}/assets/icons/unlink.svg`} alt='key'/>
        <a className='powercord-account-item' href='#' onClick={() => props.unlink()}>Unlink</a>
      </div>
    </div>
  </div>;
};
