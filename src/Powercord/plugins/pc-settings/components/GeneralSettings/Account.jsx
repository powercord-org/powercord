const { React, i18n: { Messages } } = require('powercord/webpack');
const { Icons } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');

module.exports = (props) => {
  const baseUrl = powercord.settings.get('backendURL', WEBSITE);

  return (
    <div className='powercord-account-list-account'>
      {React.createElement(Icons[props.type])}
      <span className='powercord-account-item'>
        {powercord.account.accounts[props.type.toLowerCase()]
          ? powercord.account.accounts[props.type.toLowerCase()]
          : <a href={`${baseUrl}/api/v2/oauth/${props.type.toLowerCase()}`} target='_blank'>{Messages.REPLUGGED_LINK_NOW}</a>}
      </span>
    </div>
  );
};
