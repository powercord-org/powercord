const { React, i18n: { Messages } } = require('powercord/webpack');
const { Icons } = require('powercord/components');
const { WEBSITE } = require('powercord/constants');

module.exports = (props) => {
  const baseUrl = powercord.settings.get('backendURL', WEBSITE);

  return (
    <div className='powercord-account-list-account'>
      {React.createElement(Icons[props.type])}
      <span className='powercord-account-item'>
        {powercord.account[props.type.toLowerCase()]
          ? powercord.account[props.type.toLowerCase()].name
          : <a href={`${baseUrl}/oauth/${props.type.toLowerCase()}`} target='_blank'>{Messages.POWERCORD_LINK_NOW}</a>}
      </span>
    </div>
  );
};
